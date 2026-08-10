import { AxiosError } from "axios";

/**
 * WHY THIS EXISTS AS ONE SHARED FUNCTION:
 * Before this fix, most pages either didn't check `isError` at all (silently
 * rendering a blank/broken page when a query failed) or, where they did
 * handle mutation errors, read `error.response?.data?.detail` directly —
 * which is `undefined` for a NETWORK error (backend unreachable, CORS
 * rejection, DNS failure), silently falling back to a generic message
 * that doesn't tell the user what's actually wrong. A network error and a
 * "your session expired" 401 and a "this product is out of stock" 409
 * all need different messages; this function tells them apart in one
 * place instead of every page reimplementing (or forgetting to
 * implement) that logic.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      // The request never got a response at all — the backend is down,
      // unreachable, or the request was blocked before a response came
      // back (e.g. a CORS rejection). This is the case that most often
      // shows up in the browser console as a CORS/network error, and
      // it's the one case where "check your connection" is actually the
      // right thing to tell the user, rather than a message implying the
      // backend responded with something meaningful.
      return "Can't reach the server. Check your connection, or the server may be temporarily unavailable.";
    }

    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    // FastAPI validation errors (422) return `detail` as an array of
    // per-field error objects, not a string — surface the first one
    // rather than showing "[object Object]" or nothing.
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string; loc?: unknown[] };
      const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : undefined;
      return field ? `${field}: ${first.msg ?? "Invalid value"}` : first.msg ?? "Invalid input";
    }

    if (error.response.status === 401) return "Your session has expired. Please log in again.";
    if (error.response.status === 403) return "You don't have permission to do that.";
    if (error.response.status === 404) return "We couldn't find what you were looking for.";
    if (error.response.status === 429) return "Too many requests — please wait a moment and try again.";
    if (error.response.status >= 500) return "Something went wrong on our end. Please try again shortly.";
    return "Something went wrong with that request.";
  }

  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
