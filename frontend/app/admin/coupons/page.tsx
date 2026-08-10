// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import { createCoupon, fetchCoupons } from "@/lib/admin";
// import { ErrorState } from "@/components/ErrorState";
// import type { DiscountType } from "@/types/admin";

// export default function AdminCouponsPage() {
//   const queryClient = useQueryClient();
//   const { data: coupons, isLoading, isError, error, refetch } = useQuery({
//     queryKey: ["admin", "coupons"],
//     queryFn: fetchCoupons,
//   });

//   const [code, setCode] = useState("");
//   const [discountType, setDiscountType] = useState<DiscountType>("flat");
//   const [discountValue, setDiscountValue] = useState("");
//   const [minOrderValue, setMinOrderValue] = useState("0");

//   const createMutation = useMutation({
//     mutationFn: createCoupon,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
//       setCode("");
//       setDiscountValue("");
//       toast.success("Coupon created");
//     },
//     onError: (error: AxiosError<{ detail: string }>) => {
//       toast.error(error.response?.data?.detail ?? "Couldn't create coupon");
//     },
//   });

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!code.trim() || !discountValue) return;
//     createMutation.mutate({
//       code: code.trim(),
//       discount_type: discountType,
//       discount_value: discountValue,
//       min_order_value: minOrderValue,
//     });
//   }

//   return (
//     <div>
//       <h1 className="mb-6 text-2xl font-bold">Coupons</h1>

//       <form onSubmit={handleSubmit} className="mb-6 grid max-w-xl grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
//         <input
//           required
//           placeholder="Code (e.g. SAVE100)"
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//           className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
//         />
//         <select
//           value={discountType}
//           onChange={(e) => setDiscountType(e.target.value as DiscountType)}
//           className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
//         >
//           <option value="flat">Flat amount (₹)</option>
//           <option value="percentage">Percentage (%)</option>
//         </select>
//         <input
//           required
//           type="number"
//           min="0.01"
//           step="0.01"
//           placeholder="Discount value"
//           value={discountValue}
//           onChange={(e) => setDiscountValue(e.target.value)}
//           className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
//         />
//         <div className="col-span-2">
//           <label className="mb-1 block text-xs text-neutral-500">Minimum order value (₹)</label>
//           <input
//             type="number"
//             min="0"
//             step="0.01"
//             value={minOrderValue}
//             onChange={(e) => setMinOrderValue(e.target.value)}
//             className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={createMutation.isPending}
//           className="col-span-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
//         >
//           {createMutation.isPending ? "Creating…" : "Create Coupon"}
//         </button>
//       </form>

//       {isLoading ? (
//         <p className="text-sm text-neutral-500">Loading…</p>
//       ) : isError ? (
//         <ErrorState error={error} onRetry={refetch} />
//       ) : (
//         <div className="flex flex-col gap-2">
//           {coupons?.map((coupon) => (
//             <div
//               key={coupon.id}
//               className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
//             >
//               <div>
//                 <p className="font-medium">{coupon.code}</p>
//                 <p className="text-xs text-neutral-500">
//                   {coupon.discount_type === "flat" ? `₹${coupon.discount_value} off` : `${coupon.discount_value}% off`}
//                   {" · "}min order ₹{coupon.min_order_value}
//                 </p>
//               </div>
//               <div className="text-right text-xs text-neutral-500">
//                 <p>{coupon.times_used} used{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}</p>
//                 <p className={coupon.is_active ? "text-green-600" : "text-red-500"}>
//                   {coupon.is_active ? "Active" : "Inactive"}
//                 </p>
//               </div>
//             </div>
//           ))}
//           {coupons?.length === 0 && <p className="text-sm text-neutral-500">No coupons yet.</p>}
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
  updateCouponStatus,
} from "@/lib/admin";

import { ErrorState } from "@/components/ErrorState";
import type { DiscountType } from "@/types/admin";

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();

  const {
    data: coupons,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: fetchCoupons,
  });

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState<DiscountType>("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");

  const [editingCouponId, setEditingCouponId] =
    useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createCoupon,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "coupons"],
      });

      resetForm();

      toast.success("Coupon created");
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ?? "Couldn't create coupon"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      couponId,
      payload,
    }: {
      couponId: string;
      payload: {
        code: string;
        discount_type: DiscountType;
        discount_value: string;
        min_order_value: string;
      };
    }) => updateCoupon(couponId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "coupons"],
      });

      resetForm();

      toast.success("Coupon updated");
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ?? "Couldn't update coupon"
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      couponId,
      isActive,
    }: {
      couponId: string;
      isActive: boolean;
    }) => updateCouponStatus(couponId, isActive),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "coupons"],
      });

      toast.success(
        variables.isActive
          ? "Coupon activated"
          : "Coupon deactivated"
      );
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ??
          "Couldn't update coupon status"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "coupons"],
      });

      toast.success("Coupon deleted");
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ?? "Couldn't delete coupon"
      );
    },
  });

  function resetForm() {
    setCode("");
    setDiscountType("flat");
    setDiscountValue("");
    setMinOrderValue("0");
    setEditingCouponId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim() || !discountValue) {
      return;
    }

    const payload = {
      code: code.trim(),
      discount_type: discountType,
      discount_value: discountValue,
      min_order_value: minOrderValue,
    };

    if (editingCouponId) {
      updateMutation.mutate({
        couponId: editingCouponId,
        payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleEdit(coupon: {
    id: string;
    code: string;
    discount_type: DiscountType;
    discount_value: string | number;
    min_order_value: string | number;
  }) {
    setEditingCouponId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(String(coupon.discount_value));
    setMinOrderValue(String(coupon.min_order_value));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDelete(couponId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(couponId);
  }

  function handleStatusChange(
    couponId: string,
    currentStatus: boolean
  ) {
    statusMutation.mutate({
      couponId,
      isActive: !currentStatus,
    });
  }

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
      </div>

      {/* Create / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="grid max-w-xl grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <div className="col-span-2">
          <h2 className="mb-3 text-lg font-semibold">
            {editingCouponId
              ? "Edit Coupon"
              : "Create Coupon"}
          </h2>
        </div>

        <input
          required
          placeholder="Code (e.g. SAVE100)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <select
          value={discountType}
          onChange={(e) =>
            setDiscountType(
              e.target.value as DiscountType
            )
          }
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="flat">
            Flat amount (₹)
          </option>

          <option value="percentage">
            Percentage (%)
          </option>
        </select>

        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Discount value"
          value={discountValue}
          onChange={(e) =>
            setDiscountValue(e.target.value)
          }
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <div className="col-span-2">
          <label className="mb-1 block text-xs text-neutral-500">
            Minimum order value (₹)
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={minOrderValue}
            onChange={(e) =>
              setMinOrderValue(e.target.value)
            }
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div className="col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createMutation.isPending
              ? "Creating…"
              : updateMutation.isPending
              ? "Updating…"
              : editingCouponId
              ? "Update Coupon"
              : "Create Coupon"}
          </button>

          {editingCouponId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Loading */}
      {isLoading && (
        <p className="text-sm text-neutral-500">
          Loading…
        </p>
      )}

      {/* Error */}
      {isError && (
        <ErrorState
          error={error}
          onRetry={refetch}
        />
      )}

      {/* Coupons */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {coupons?.map((coupon) => (
            <div
              key={coupon.id}
              className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Coupon Information */}
                <div>
                  <p className="font-semibold">
                    {coupon.code}
                  </p>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {coupon.discount_type === "flat"
                      ? `₹${coupon.discount_value} off`
                      : `${coupon.discount_value}% off`}
                    {" · "}min order ₹
                    {coupon.min_order_value}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {coupon.times_used} used
                    {coupon.usage_limit
                      ? ` / ${coupon.usage_limit}`
                      : ""}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <span
                    className={
                      coupon.is_active
                        ? "text-sm font-medium text-green-600"
                        : "text-sm font-medium text-red-500"
                    }
                  >
                    {coupon.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(coupon)
                    }
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                  >
                    Edit
                  </button>

                  {/* Activate / Deactivate */}
                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      handleStatusChange(
                        coupon.id,
                        coupon.is_active
                      )
                    }
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
                  >
                    {coupon.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() =>
                      handleDelete(coupon.id)
                    }
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {coupons?.length === 0 && (
            <p className="text-sm text-neutral-500">
              No coupons yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}