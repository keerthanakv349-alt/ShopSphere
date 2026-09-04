"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { fetchAdminIssues, updateIssueStatus, type AdminIssueReport } from "@/lib/admin";
import { ErrorState } from "@/components/ErrorState";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export default function AdminIssuesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftResponse, setDraftResponse] = useState("");

  const { data: issues, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "issues", statusFilter],
    queryFn: () => fetchAdminIssues(statusFilter || undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: string; admin_response?: string } }) =>
      updateIssueStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "issues"] });
      toast.success("Issue updated — the customer has been notified");
      setExpandedId(null);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't update this issue");
    },
  });

  function handleExpand(issue: AdminIssueReport) {
    if (expandedId === issue.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(issue.id);
    setDraftStatus(issue.status);
    setDraftResponse(issue.admin_response ?? "");
  }

  function handleSave(issueId: string) {
    updateMutation.mutate({
      id: issueId,
      payload: { status: draftStatus, admin_response: draftResponse.trim() || undefined },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reported Issues</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Customer-submitted problems from "Report an Issue." Responding here also notifies the customer.
        </p>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {issues?.map((issue) => (
            <div
              key={issue.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
              <button
                onClick={() => handleExpand(issue)}
                className="flex w-full items-center gap-3 p-3 text-left text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{issue.subject}</p>
                  <p className="text-xs text-neutral-500">
                    {issue.user_name} · {issue.user_email}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[issue.status]}`}>
                  {STATUS_OPTIONS.find((o) => o.value === issue.status)?.label ?? issue.status}
                </span>

                <p className="shrink-0 text-xs text-neutral-400">
                  {new Date(issue.created_at).toLocaleDateString("en-IN")}
                </p>
              </button>

              {expandedId === issue.id && (
                <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
                  <p className="mb-3 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    {issue.message}
                  </p>

                  <label className="mb-1 block text-xs text-neutral-500">Status</label>
                  <select
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <label className="mb-1 block text-xs text-neutral-500">
                    Response to customer (they'll see this + get notified)
                  </label>
                  <textarea
                    value={draftResponse}
                    onChange={(e) => setDraftResponse(e.target.value)}
                    rows={3}
                    className="mb-3 w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    placeholder="Optional — leave blank to just change status silently"
                  />

                  <button
                    onClick={() => handleSave(issue.id)}
                    disabled={updateMutation.isPending}
                    className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {updateMutation.isPending ? "Saving…" : "Save & Notify Customer"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {issues?.length === 0 && (
            <p className="text-sm text-neutral-500">No reported issues{statusFilter ? " with this status" : ""}.</p>
          )}
        </div>
      )}
    </div>
  );
}
