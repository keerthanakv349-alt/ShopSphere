"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { fetchAuditLog } from "@/lib/admin";
import { ErrorState } from "@/components/ErrorState";

const ENTITY_TYPES = [
  "product",
  "order",
  "user",
  "coupon",
  "settings",
  "delivery_partner",
  "inventory",
];

const ACTION_STYLES: Record<string, string> = {
  create: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  status_change: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  role_change: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  import: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminAuditLogPage() {
  const [entityType, setEntityType] = useState("");
  const [q, setQ] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "audit-log", entityType, q],
    queryFn: () =>
      fetchAuditLog({
        entity_type: entityType || undefined,
        q: q.trim() || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="mt-1 text-sm text-neutral-500">
          A record of admin actions — who changed what, and when. Read-only.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search description or admin name…"
          className="w-64 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">All entities</option>
          {ENTITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Entity</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((entry) => (
                <tr key={entry.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="whitespace-nowrap px-4 py-2 text-neutral-500">
                    {formatTimestamp(entry.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium">{entry.admin_name}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        ACTION_STYLES[entry.action] ??
                        "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                      }`}
                    >
                      {entry.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-neutral-500">
                    {entry.entity_type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-2">{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.length === 0 && (
            <p className="p-4 text-sm text-neutral-500">No matching activity yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
