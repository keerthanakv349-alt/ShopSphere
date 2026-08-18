


"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { fetchAdminPayments, refundPayment } from "@/lib/admin";
import { formatINR } from "@/lib/price";
import { ErrorState } from "@/components/ErrorState";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  created:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  refunded:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status] ??
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
  );
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();

  const [selectedPayment, setSelectedPayment] = useState<{
    id: string;
    amount: string;
    razorpayOrderId: string;
  } | null>(null);

  const {
    data: payments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: fetchAdminPayments,
  });

  const refundMutation = useMutation({
    mutationFn: (paymentId: string) => refundPayment(paymentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "payments"],
      });

      toast.success("Refund processed successfully");

      setSelectedPayment(null);
    },

    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(
        error.response?.data?.detail ?? "Refund failed"
      );
    },
  });

  const handleRefund = () => {
    if (!selectedPayment) return;

    refundMutation.mutate(selectedPayment.id);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>

        <p className="mt-1 text-sm text-neutral-500">
          View payment transactions and manage refunds.
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">
            Loading payments…
          </p>
        </div>
      ) : isError ? (
        /* Error */
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        /* Payments */
        <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
          {/* Header */}
          <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_100px] md:items-center md:gap-4">
            <span>Payment</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
            <span>Action</span>
          </div>

          {/* Payment List */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {payments?.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-4 p-4 text-sm md:grid md:grid-cols-[2fr_1fr_1fr_1fr_100px] md:items-center md:gap-4"
              >
                {/* Payment Details */}
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium text-neutral-500">
                    Razorpay Order
                  </p>

                  <p className="truncate font-mono text-xs">
                    {payment.razorpay_order_id}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Payment ID: {payment.id}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500 md:hidden">
                    Amount
                  </p>

                  <p className="font-semibold">
                    {formatINR(parseFloat(payment.amount))}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500 md:hidden">
                    Status
                  </p>

                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500 md:hidden">
                    Date
                  </p>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Action */}
                <div>
                  {payment.status === "paid" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPayment({
                          id: payment.id,
                          amount: payment.amount,
                          razorpayOrderId: payment.razorpay_order_id,
                        })
                      }
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      Refund
                    </button>
                  ) : payment.status === "refunded" ? (
                    <span className="text-xs text-blue-600">
                      Refunded
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">
                      —
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {payments?.length === 0 && (
              <div className="p-8 text-center">
                <p className="font-medium">
                  No payments yet.
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Payment transactions will appear here once customers
                  make payments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-950">
            {/* Modal Header */}
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Refund Payment
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Are you sure you want to refund this payment?
              </p>
            </div>

            {/* Payment Information */}
            <div className="mb-6 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-500">
                  Razorpay Order
                </span>

                <span className="max-w-[220px] truncate font-mono text-xs">
                  {selectedPayment.razorpayOrderId}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-500">
                  Amount
                </span>

                <span className="font-semibold">
                  {formatINR(
                    parseFloat(selectedPayment.amount)
                  )}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-400">
              This action will process a refund for the selected
              payment. Please verify the payment before continuing.
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                disabled={refundMutation.isPending}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRefund}
                disabled={refundMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refundMutation.isPending
                  ? "Processing..."
                  : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}