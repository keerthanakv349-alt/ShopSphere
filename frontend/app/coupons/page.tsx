"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCopy, FiTag } from "react-icons/fi";

import { fetchActiveCoupons } from "@/lib/coupons";
import { formatINR } from "@/lib/price";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";
import type { Coupon } from "@/types/admin";

function describeDiscount(coupon: Coupon): string {
  if (coupon.discount_type === "percentage") {
    const cap = coupon.max_discount_amount
      ? `, up to ${formatINR(parseFloat(coupon.max_discount_amount))}`
      : "";
    return `${parseFloat(coupon.discount_value)}% off${cap}`;
  }
  return `${formatINR(parseFloat(coupon.discount_value))} off`;
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  function handleCopy() {
    navigator.clipboard
      .writeText(coupon.code)
      .then(() => toast.success(`Copied "${coupon.code}"`))
      .catch(() => toast.error("Couldn't copy — select and copy the code manually"));
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-brand/40 bg-white p-5 shadow-sm dark:bg-neutral-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <FiTag size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-lg font-bold tracking-wide text-neutral-900 dark:text-white">
          {coupon.code}
        </p>
        <p className="text-sm font-medium text-brand">{describeDiscount(coupon)}</p>
        <p className="mt-1 text-xs text-neutral-500">
          Minimum order {formatINR(parseFloat(coupon.min_order_value))}
          {coupon.valid_until && (
            <> · Valid until {new Date(coupon.valid_until).toLocaleDateString("en-IN")}</>
          )}
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200"
      >
        <FiCopy size={14} />
        Copy
      </button>
    </div>
  );
}

function MyCouponsContent() {
  const { data: coupons, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["coupons", "active"],
    queryFn: fetchActiveCoupons,
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            aria-label="Back to profile"
          >
            <FiArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Coupons</h1>
            <p className="text-sm text-neutral-500">Codes you can apply at checkout right now</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : coupons && coupons.length > 0 ? (
          <div className="flex flex-col gap-3">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <FiTag size={28} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-sm text-neutral-500">No coupons are available right now — check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function MyCouponsPage() {
  return (
    <ProtectedRoute>
      <MyCouponsContent />
    </ProtectedRoute>
  );
}
