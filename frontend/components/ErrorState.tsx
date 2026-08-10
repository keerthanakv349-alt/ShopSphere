"use client";

import { getErrorMessage } from "@/lib/error-message";

/**
 * WHY THIS COMPONENT EXISTS:
 * Before this fix, most pages in this app checked `isLoading` but never
 * `isError` — when a query failed (network down, backend error, expired
 * session), React Query correctly set `isLoading` to false, and the page
 * would render its normal content with `data` as `undefined`. Depending
 * on the page, that meant either a blank section, a crash on
 * `data.map(...)`, or fields silently rendering empty ("Name: ",
 * "Email: ") with no indication anything had gone wrong. This component
 * is the standard replacement: a clear message (via getErrorMessage,
 * which tells network errors apart from real HTTP responses) and a retry
 * button that just calls the query's own `refetch`.
 */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
      <p className="text-sm font-medium text-red-700 dark:text-red-400">{getErrorMessage(error)}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900"
        >
          Try again
        </button>
      )}
    </div>
  );
}
