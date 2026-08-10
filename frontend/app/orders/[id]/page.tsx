"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { fetchMyOrder } from "@/lib/cart";
import { createRazorpayOrder, fetchOrderPayments, verifyRazorpayPayment } from "@/lib/payments";
import { loadRazorpayCheckoutScript } from "@/lib/razorpay-script";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";
import { formatINR } from "@/lib/price";
import { OrderTracking } from "@/components/OrderTracking";
import type { OrderStatus } from "@/types/cart";

// Mirrors the backend's _FORWARD_TRANSITIONS lifecycle (admin_orders.py) —
// used here just to render an ordered progress trail, not to enforce
// anything (enforcement is server-side, where it belongs).
const STATUS_SEQUENCE: OrderStatus[] = ["pending", "packed", "shipped", "out_for_delivery", "delivered"];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Placed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => fetchMyOrder(params.id),
  });
  const { data: payments } = useQuery({
    queryKey: ["payments", params.id],
    queryFn: () => fetchOrderPayments(params.id),
  });

  const isPaid = payments?.some((p) => p.status === "paid") ?? false;

  const verifyMutation = useMutation({
    mutationFn: verifyRazorpayPayment,
    onSuccess: () => {
      toast.success("Payment successful!");
      queryClient.invalidateQueries({ queryKey: ["order", params.id] });
      queryClient.invalidateQueries({ queryKey: ["payments", params.id] });
    },
    onError: () => toast.error("Payment verification failed — please contact support."),
  });

  async function handlePayNow() {
    if (!order) return;
    setIsPaying(true);
    try {
      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Couldn't load the payment gateway. Please try again.");
        return;
      }

      const razorpayOrder = await createRazorpayOrder(order.id);

      const checkout = new window.Razorpay({
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.razorpay_order_id,
        name: "ShopSphere",
        description: `Order ${order.order_number}`,
        prefill: { name: order.shipping_full_name, contact: order.shipping_phone_number },
        theme: { color: "#FF3E6C" },
        handler: (response) => {
          // Immediately hand the callback to our backend for signature
          // verification (see app/api/v1/payments.py) — the widget
          // saying "success" is not itself proof of payment.
          verifyMutation.mutate(response);
        },
        modal: { ondismiss: () => setIsPaying(false) },
      });
      checkout.open();
    } catch {
      toast.error("Couldn't start payment. Please try again.");
    } finally {
      setIsPaying(false);
    }
  }

  if (isLoading) return <p className="p-16 text-center text-sm text-neutral-500">Loading…</p>;

  if (isError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <ErrorState error={error} onRetry={refetch} />
      </main>
    );
  }

  if (!order) return <p className="p-16 text-center text-sm text-neutral-500">Order not found.</p>;

  const isTerminalNonDelivery = order.status === "cancelled";
  const currentStepIndex = STATUS_SEQUENCE.indexOf(order.status);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-neutral-500">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium dark:bg-neutral-900">
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div>
          <p className="text-sm font-medium">
            {isPaid ? "Payment received" : order.status === "cancelled" ? "Payment not required" : "Payment pending"}
          </p>
          <p className="text-xs text-neutral-500">{formatINR(parseFloat(order.total_amount))}</p>
        </div>
        {!isPaid && order.status !== "cancelled" && order.status !== "refunded" && (
          <button
            onClick={handlePayNow}
            disabled={isPaying || verifyMutation.isPending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {isPaying || verifyMutation.isPending ? "Processing…" : "Pay Now"}
          </button>
        )}
        {isPaid && <span className="text-sm font-medium text-green-600">✓ Paid</span>}
      </div>

      {!isTerminalNonDelivery && order.status !== "returned" && order.status !== "refunded" && (
        <div className="mb-8 flex items-center">
          {STATUS_SEQUENCE.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  i <= currentStepIndex ? "bg-brand text-white" : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800"
                }`}
              >
                {i + 1}
              </div>
              {i < STATUS_SEQUENCE.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${i < currentStepIndex ? "bg-brand" : "bg-neutral-200 dark:bg-neutral-800"}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <section className="mb-6 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-3 text-sm font-semibold">Items</h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-neutral-500">
                  {[item.color, item.size].filter(Boolean).join(" / ")} · Qty {item.quantity}
                </p>
              </div>
              <p>{formatINR(parseFloat(item.line_total))}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span>{formatINR(parseFloat(order.subtotal))}</span>
          </div>
          {parseFloat(order.discount_amount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
              <span>-{formatINR(parseFloat(order.discount_amount))}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-500">GST</span>
            <span>{formatINR(parseFloat(order.gst_amount))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Shipping</span>
            <span>{formatINR(parseFloat(order.shipping_charge))}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 font-semibold dark:border-neutral-800">
            <span>Total</span>
            <span>{formatINR(parseFloat(order.total_amount))}</span>
          </div>
        </div>
      </section>

      <OrderTracking orderId={order.id} />

      <section className="rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
        <h2 className="mb-2 text-sm font-semibold">Shipping Address</h2>
        <p>{order.shipping_full_name}</p>
        <p className="text-neutral-500">
          {order.shipping_line1}, {order.shipping_line2 ? `${order.shipping_line2}, ` : ""}
          {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
        </p>
        <p className="text-neutral-500">{order.shipping_phone_number}</p>
      </section>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
