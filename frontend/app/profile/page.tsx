"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMe, logoutRequest } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";
import { useRouter } from "next/navigation";

function ProfileContent() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  // Re-fetches the canonical user record from the backend (source of
  // truth) rather than trusting the possibly-stale copy in Zustand —
  // e.g. if is_email_verified changed since login, this reflects it.
  const { data: user, isLoading, isError, error, refetch } = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      logout();
      router.push("/login");
    }
  }

  if (isLoading) return <p className="p-8 text-center text-sm text-neutral-500">Loading…</p>;

  if (isError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <ErrorState error={error} onRetry={refetch} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3 px-4">
      <h1 className="text-2xl font-bold">Your profile</h1>
      <p><span className="text-neutral-500">Name:</span> {user?.full_name}</p>
      <p><span className="text-neutral-500">Email:</span> {user?.email}</p>
      <p><span className="text-neutral-500">Role:</span> {user?.role}</p>
      <button
        onClick={handleLogout}
        className="mt-4 rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        Log out
      </button>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
