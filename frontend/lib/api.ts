"use client";

/**
 * Central Axios instance.
 *
 * WHY A RESPONSE INTERCEPTOR FOR 401s:
 * Access tokens expire every 15 minutes (see backend ACCESS_TOKEN_EXPIRE_MINUTES).
 * Without this interceptor, every component that calls the API would need
 * its own "if 401, refresh and retry" logic — messy and easy to get wrong.
 * Instead, we handle it in ONE place: any request that comes back 401
 * automatically tries /auth/refresh once, and if that succeeds, silently
 * retries the original request with the new token. The calling component
 * never even sees the 401 — it just gets its data, possibly a beat later.
 * If refresh also fails (refresh token expired/invalid), we log the user
 * out and let normal "protected route" redirects handle sending them to
 * /login.
 *
 * WHY /auth/login, /auth/signup, AND /auth/refresh ITSELF ARE EXCLUDED
 * FROM THIS LOGIC:
 * A 401 from /auth/login means "wrong email or password" — a completely
 * normal, expected response the login page needs to show to the user.
 * Without this exclusion, that 401 would trigger the block below: it
 * tries to refresh a token, but a not-yet-logged-in user has no
 * refresh_token, so refreshAccessToken() immediately throws, the catch
 * block logs out (a no-op, nothing to log out of) and HARD-REDIRECTS the
 * page to /login — wiping out the login form's React state before the
 * "Incorrect email or password" toast can ever render, and replacing the
 * real backend error with a generic "No refresh token available" message
 * that isn't even an AxiosError, so `error.response?.data?.detail` on the
 * calling page silently resolves to undefined. The same problem applies
 * to /auth/signup (409 conflicts, though those aren't 401, are still
 * worth excluding defensively) and to /auth/refresh itself (a failed
 * refresh should never try to refresh-and-retry ITSELF — that's exactly
 * the infinite-loop shape this guard exists to prevent).
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/auth-store";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({ baseURL: API_BASE_URL });

// Paths whose OWN 401/409 responses are meaningful, expected API answers
// (wrong password, duplicate email, expired refresh token) — never
// treated as "your session expired, let's silently refresh and retry."
const AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH = ["/api/v1/auth/login", "/api/v1/auth/signup", "/api/v1/auth/refresh"];

function isExemptFromRefresh(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH.some((path) => url.includes(path));
}

api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;

  console.log("API Request:", config.url);
  console.log("Access Token:", tokens?.access_token);

  if (tokens?.access_token) {
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
  }

  return config;
});
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const currentTokens = useAuthStore.getState().tokens;
  if (!currentTokens?.refresh_token) throw new Error("No refresh token available");

  const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
    refresh_token: currentTokens.refresh_token,
  });
  useAuthStore.getState().setTokens(data);
  return data.access_token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const shouldAttemptRefresh =
      error.response?.status === 401 && !originalRequest._retry && !isExemptFromRefresh(originalRequest.url);

    if (shouldAttemptRefresh) {
      originalRequest._retry = true;
      try {
        // De-dupe concurrent refresh calls: if 3 requests 401 at once, we
        // only want ONE call to /auth/refresh, not three racing each other.
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        refreshPromise = null;
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") window.location.href = "/login";
        // Reject with the ORIGINAL error (the real 401 from whatever the
        // user was actually doing), not the internal refresh-attempt
        // failure — a caller that inspects this before the redirect
        // takes effect still sees something meaningful.
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
