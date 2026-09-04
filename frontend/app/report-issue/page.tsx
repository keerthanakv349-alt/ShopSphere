"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import Link from "next/link";

import { createIssueReport, fetchMyIssueReports, type IssueStatus } from "@/lib/issues";
import { ProtectedRoute } from "@/lib/protected-route";
import { getErrorMessage } from "@/lib/error-message";

const STATUS_LABELS: Record<IssueStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_STYLES: Record<IssueStatus, string> = {
  open: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

function ReportIssueContent() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: myReports } = useQuery({
    queryKey: ["my-issue-reports"],
    queryFn: fetchMyIssueReports,
  });

  const submitMutation = useMutation({
    mutationFn: () => createIssueReport(subject.trim(), message.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issue-reports"] });
      setSubject("");
      setMessage("");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    submitMutation.mutate();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center text-sm font-medium text-brand hover:underline"
      >
        ← Back to Profile
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Report an Issue
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Tell us about a problem you experienced while using ShopSphere. A real person will follow up here and in your notifications.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
      >
        <div className="mb-5">
          <label htmlFor="subject" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Subject
          </label>

          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What is the issue?"
            maxLength={120}
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Describe the issue
          </label>

          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Please describe what happened..."
            rows={6}
            maxLength={2000}
            required
            className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        {submitMutation.isSuccess && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Your issue has been recorded. We'll respond here and notify you when there's an update.
          </div>
        )}

        {submitMutation.isError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(submitMutation.error)}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/profile"
            className="rounded-lg border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitMutation.isPending ? "Submitting…" : "Submit Issue"}
          </button>
        </div>
      </form>

      {myReports && myReports.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
            Your reported issues
          </h2>

          <div className="flex flex-col gap-3">
            {myReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-neutral-900 dark:text-white">{report.subject}</p>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[report.status]}`}>
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>

                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{report.message}</p>

                {report.admin_response && (
                  <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      ShopSphere Support
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300">{report.admin_response}</p>
                  </div>
                )}

                <p className="mt-2 text-xs text-neutral-400">
                  {new Date(report.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default function ReportIssuePage() {
  return (
    <ProtectedRoute>
      <ReportIssueContent />
    </ProtectedRoute>
  );
}
