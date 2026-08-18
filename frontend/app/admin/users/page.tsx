// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { useState } from "react";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import { fetchAdminUsers, updateUserRole, updateUserStatus } from "@/lib/admin";
// import { useAuthStore } from "@/lib/auth-store";
// import { ErrorState } from "@/components/ErrorState";
// import type { UserRole } from "@/types/admin";

// export default function AdminUsersPage() {
//   const queryClient = useQueryClient();
//   const currentUser = useAuthStore((s) => s.user);
//   const isSuperAdmin = currentUser?.role === "super_admin";
//   const [search, setSearch] = useState("");

//   const { data: users, isLoading, isError, error, refetch } = useQuery({
//     queryKey: ["admin", "users", search],
//     queryFn: () => fetchAdminUsers(search || undefined),
//   });

//   const statusMutation = useMutation({
//     mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
//       updateUserStatus(userId, isActive),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
//       toast.success("User updated");
//     },
//     onError: (error: AxiosError<{ detail: string }>) => {
//       toast.error(error.response?.data?.detail ?? "Couldn't update user");
//     },
//   });

//   const roleMutation = useMutation({
//     mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => updateUserRole(userId, role),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
//       toast.success("Role updated");
//     },
//     onError: (error: AxiosError<{ detail: string }>) => {
//       toast.error(error.response?.data?.detail ?? "Couldn't update role");
//     },
//   });

//   return (
//     <div>
//       <h1 className="mb-6 text-2xl font-bold">Users</h1>

//       <input
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         placeholder="Search by name or email…"
//         className="mb-4 w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
//       />

//       {isLoading ? (
//         <p className="text-sm text-neutral-500">Loading…</p>
//       ) : isError ? (
//         <ErrorState error={error} onRetry={refetch} />
//       ) : (
//         <div className="flex flex-col gap-2">
//           {users?.map((user) => (
//             <div
//               key={user.id}
//               className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
//             >
//               <div>
//                 <p className="font-medium">{user.full_name}</p>
//                 <p className="text-xs text-neutral-500">{user.email}</p>
//               </div>

//               {isSuperAdmin && user.id !== currentUser?.id ? (
//                 <select
//                   value={user.role}
//                   onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value as UserRole })}
//                   className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
//                 >
//                   <option value="customer">customer</option>
//                   <option value="admin">admin</option>
//                   <option value="super_admin">super_admin</option>
//                 </select>
//               ) : (
//                 <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
//                   {user.role}
//                 </span>
//               )}

//               <span className={user.is_active ? "text-xs text-green-600" : "text-xs text-red-500"}>
//                 {user.is_active ? "Active" : "Deactivated"}
//               </span>

//               {user.id !== currentUser?.id && (
//                 <button
//                   onClick={() => statusMutation.mutate({ userId: user.id, isActive: !user.is_active })}
//                   className="rounded-md border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
//                 >
//                   {user.is_active ? "Deactivate" : "Reactivate"}
//                 </button>
//               )}
//             </div>
//           ))}
//           {users?.length === 0 && <p className="text-sm text-neutral-500">No users found.</p>}
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  fetchAdminUsers,
  updateUserRole,
  updateUserStatus,
} from "@/lib/admin";

import { useAuthStore } from "@/lib/auth-store";
import { ErrorState } from "@/components/ErrorState";
import type { UserRole } from "@/types/admin";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [search, setSearch] = useState("");

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => fetchAdminUsers(search || undefined),
  });

  // --------------------------------------------------
  // Update user active/deactivated status
  // --------------------------------------------------
  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => updateUserStatus(userId, isActive),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      toast.success("User updated");
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ?? "Couldn't update user"
      );
    },
  });

  // --------------------------------------------------
  // Update user role
  // --------------------------------------------------
  const roleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => updateUserRole(userId, role),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });

      toast.success("Role updated");
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ?? "Couldn't update role"
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------
          Page Header
      -------------------------------------------------- */}
      <div>
        <h1 className="text-2xl font-bold">
          Customers
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Manage customers, account status, roles, and customer details.
        </p>
      </div>

      {/* --------------------------------------------------
          Search
      -------------------------------------------------- */}
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-md rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      {/* --------------------------------------------------
          Loading
      -------------------------------------------------- */}
      {isLoading && (
        <p className="text-sm text-neutral-500">
          Loading customers…
        </p>
      )}

      {/* --------------------------------------------------
          Error
      -------------------------------------------------- */}
      {isError && (
        <ErrorState
          error={error}
          onRetry={refetch}
        />
      )}

      {/* --------------------------------------------------
          Customer List
      -------------------------------------------------- */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {users?.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              {/* ------------------------------------------
                  Customer information
              ------------------------------------------ */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Customer */}
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {user.full_name}
                  </p>

                  <p className="mt-1 break-all text-xs text-neutral-500">
                    {user.email}
                  </p>
                </div>

                {/* ----------------------------------------
                    Role + Status
                ---------------------------------------- */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Role */}
                  {isSuperAdmin &&
                  user.id !== currentUser?.id ? (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        roleMutation.mutate({
                          userId: user.id,
                          role: e.target.value as UserRole,
                        })
                      }
                      disabled={roleMutation.isPending}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <option value="customer">
                        customer
                      </option>

                      <option value="admin">
                        admin
                      </option>

                      <option value="super_admin">
                        super_admin
                      </option>
                    </select>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                      {user.role}
                    </span>
                  )}

                  {/* Status */}
                  <span
                    className={
                      user.is_active
                        ? "text-xs font-medium text-green-600"
                        : "text-xs font-medium text-red-500"
                    }
                  >
                    {user.is_active
                      ? "Active"
                      : "Deactivated"}
                  </span>
                </div>

                {/* ----------------------------------------
                    Actions
                ---------------------------------------- */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* View Details */}
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                  >
                    View Details
                  </Link>

                  {/* Deactivate / Reactivate */}
                  {user.id !== currentUser?.id && (
                    <button
                      type="button"
                      onClick={() =>
                        statusMutation.mutate({
                          userId: user.id,
                          isActive: !user.is_active,
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      {statusMutation.isPending
                        ? "Updating..."
                        : user.is_active
                          ? "Deactivate"
                          : "Reactivate"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ------------------------------------------------
              Empty state
          ------------------------------------------------ */}
          {users?.length === 0 && (
            <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-500">
                No customers found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}