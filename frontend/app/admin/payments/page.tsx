"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { fetchAdminPayments, refundPayment } from "@/lib/admin";
import { formatINR } from "@/lib/price";
import { ErrorState } from "@/components/ErrorState";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  created: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  refunded: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: fetchAdminPayments,
  });

  const refundMutation = useMutation({
    mutationFn: (paymentId: string) => refundPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      toast.success("Refund processed");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Refund failed");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Payments</h1>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {payments?.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-neutral-500">{payment.razorpay_order_id}</p>
                <p className="text-xs text-neutral-500">{new Date(payment.created_at).toLocaleString()}</p>
              </div>
              <p className="font-semibold">{formatINR(parseFloat(payment.amount))}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}>
                {payment.status}
              </span>
              {payment.status === "paid" && (
                <button
                  onClick={() => refundMutation.mutate(payment.id)}
                  disabled={refundMutation.isPending}
                  className="rounded-md border border-neutral-300 px-3 py-1 text-xs disabled:opacity-60 dark:border-neutral-700"
                >
                  Refund
                </button>
              )}
            </div>
          ))}
          {payments?.length === 0 && <p className="text-sm text-neutral-500">No payments yet.</p>}
        </div>
      )}
    </div>
  );
}
