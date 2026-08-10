"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminUsers, updateUserRole, updateUserStatus } from "@/lib/admin";
import { useAuthStore } from "@/lib/auth-store";
import { ErrorState } from "@/components/ErrorState";
import type { UserRole } from "@/types/admin";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [search, setSearch] = useState("");

  const { data: users, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => fetchAdminUsers(search || undefined),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't update user");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role updated");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't update role");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="mb-4 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>

              {isSuperAdmin && user.id !== currentUser?.id ? (
                <select
                  value={user.role}
                  onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value as UserRole })}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              ) : (
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                  {user.role}
                </span>
              )}

              <span className={user.is_active ? "text-xs text-green-600" : "text-xs text-red-500"}>
                {user.is_active ? "Active" : "Deactivated"}
              </span>

              {user.id !== currentUser?.id && (
                <button
                  onClick={() => statusMutation.mutate({ userId: user.id, isActive: !user.is_active })}
                  className="rounded-md border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
                >
                  {user.is_active ? "Deactivate" : "Reactivate"}
                </button>
              )}
            </div>
          ))}
          {users?.length === 0 && <p className="text-sm text-neutral-500">No users found.</p>}
        </div>
      )}
    </div>
  );
}
