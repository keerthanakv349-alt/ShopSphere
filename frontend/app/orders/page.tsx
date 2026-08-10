"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchMyOrders } from "@/lib/cart";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";
import { formatINR } from "@/lib/price";
import type { OrderStatus } from "@/types/cart";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

function OrdersContent() {
  const { data: orders, isLoading, isError, error, refetch } = useQuery({ queryKey: ["orders"], queryFn: fetchMyOrders });

  if (isLoading) return <p className="p-16 text-center text-sm text-neutral-500">Loading…</p>;

  if (isError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <ErrorState error={error} onRetry={refetch} />
      </main>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-bold">No orders yet</h1>
        <Link href="/products" className="text-sm text-brand hover:underline">
          Start shopping →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Your Orders</h1>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 text-sm hover:border-brand dark:border-neutral-800"
          >
            <div>
              <p className="font-medium">{order.order_number}</p>
              <p className="text-neutral-500">
                {new Date(order.created_at).toLocaleDateString()} · {order.items.length} item(s)
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatINR(parseFloat(order.total_amount))}</p>
              <p className="text-xs text-neutral-500">{STATUS_LABELS[order.status]}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
