"use client";

/**
 * WHY A WRAPPER COMPONENT INSTEAD OF MIDDLEWARE-ONLY:
 * Next.js middleware (middleware.ts) runs at the edge and can redirect
 * before a page renders, but it can only see cookies, not our Zustand/
 * localStorage auth state (edge runtime has no localStorage). Since we
 * store tokens client-side (see lib/auth-store.ts), the reliable check
 * has to happen in a Client Component. This wrapper is used like:
 *
 *   <ProtectedRoute>{children}</ProtectedRoute>
 *
 * in any page that requires login (profile, checkout, orders). For
 * routes that also need a specific ROLE (e.g. the whole /admin section),
 * pass `allowedRoles` — this is the same require_role() pattern as the
 * backend's dependency, just mirrored on the client for UX (the backend
 * remains the actual enforcement point; a client check is just to avoid
 * flashing admin UI at a logged-out or non-admin user).
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import type { UserRole } from "@/types/user";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);

  useEffect(() => {
    if (!tokens || !user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, tokens, allowedRoles, router]);

  if (!tokens || !user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
