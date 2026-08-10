"use client";

/**
 * Next.js App Router convention: a file named error.tsx at any route
 * level automatically becomes the error boundary for that segment.
 * Without this, an unhandled render error would show Next.js's generic
 * crash screen (or a blank page in production). This gives users a
 * recoverable UI instead, and gives us one place to (eventually) pipe
 * errors to a logging service like Sentry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Something went wrong
      </h2>
      <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}
