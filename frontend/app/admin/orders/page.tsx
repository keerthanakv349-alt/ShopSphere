"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  addTrackingEvent,
  createDeliveryPartner,
  fetchAdminOrders,
  fetchDeliveryPartners,
  updateOrderStatus,
} from "@/lib/admin";
import { formatINR } from "@/lib/price";
import { ErrorState } from "@/components/ErrorState";
import type { OrderStatus } from "@/types/cart";
import type { TrackingStatus } from "@/types/engagement";

// Mirrors the backend's _FORWARD_TRANSITIONS (admin_orders.py) — the
// server is the real source of truth and will reject anything invalid;
// this just avoids offering an admin an option that would 400.
const NEXT_STATUS_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["returned"],
  returned: ["refunded"],
  cancelled: [],
  refunded: [],
};

const TRACKING_STATUSES: TrackingStatus[] = ["order_packed", "shipped", "in_transit", "out_for_delivery", "delivered"];

interface DeliveryPartnerLite {
  id: string;
  name: string;
  phone_number: string;
  vehicle_number: string | null;
  is_active: boolean;
}

function TrackingPanel({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();
  const { data: partners } = useQuery({ queryKey: ["admin", "delivery-partners"], queryFn: fetchDeliveryPartners });

  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>("order_packed");
  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [partnerId, setPartnerId] = useState("");

  const createPartnerMutation = useMutation({
    mutationFn: createDeliveryPartner,
    onSuccess: (partner: DeliveryPartnerLite) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "delivery-partners"] });
      setPartnerId(partner.id);
      toast.success("Delivery partner added");
    },
  });

  const addEventMutation = useMutation({
    mutationFn: () =>
      addTrackingEvent(orderId, {
        status: trackingStatus,
        location_label: locationLabel || undefined,
        latitude: lat ? Number(lat) : undefined,
        longitude: lng ? Number(lng) : undefined,
        delivery_partner_id: partnerId || undefined,
      }),
    onSuccess: () => {
      toast.success("Tracking event added");
      setLocationLabel("");
      setLat("");
      setLng("");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't add tracking event");
    },
  });

  function handleQuickAddPartner() {
    const name = prompt("Delivery partner name?");
    if (!name) return;
    const phone = prompt("Phone number?") ?? "";
    createPartnerMutation.mutate({ name, phone_number: phone });
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-dashed border-neutral-300 p-3 text-xs dark:border-neutral-700 sm:grid-cols-6">
      <select
        value={trackingStatus}
        onChange={(e) => setTrackingStatus(e.target.value as TrackingStatus)}
        className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      >
        {TRACKING_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <input
        value={locationLabel}
        onChange={(e) => setLocationLabel(e.target.value)}
        placeholder="Location (e.g. Mumbai Hub)"
        className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <input
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        placeholder="Latitude"
        className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <input
        value={lng}
        onChange={(e) => setLng(e.target.value)}
        placeholder="Longitude"
        className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <select
        value={partnerId}
        onChange={(e) => (e.target.value === "__new" ? handleQuickAddPartner() : setPartnerId(e.target.value))}
        className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">No courier</option>
        {partners?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value="__new">+ Add new…</option>
      </select>
      <button
        onClick={() => addEventMutation.mutate()}
        disabled={addEventMutation.isPending}
        className="rounded-md bg-brand px-3 py-1 font-medium text-white disabled:opacity-60"
      >
        {addEventMutation.isPending ? "Adding…" : "Add Event"}
      </button>
    </div>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchAdminOrders,
  });
  const [trackingOpenFor, setTrackingOpenFor] = useState<string | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't update order status");
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {orders?.map((order) => {
            const nextOptions = NEXT_STATUS_OPTIONS[order.status];
            return (
              <div key={order.id} className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <p className="font-semibold">{formatINR(parseFloat(order.total_amount))}</p>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900">
                    {order.status}
                  </span>
                  {nextOptions.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          statusMutation.mutate({ orderId: order.id, status: e.target.value as OrderStatus });
                        }
                      }}
                      className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <option value="">Update status…</option>
                      {nextOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => setTrackingOpenFor(trackingOpenFor === order.id ? null : order.id)}
                    className="text-xs text-brand hover:underline"
                  >
                    {trackingOpenFor === order.id ? "Hide tracking" : "Add tracking event"}
                  </button>
                </div>
                {trackingOpenFor === order.id && <TrackingPanel orderId={order.id} />}
              </div>
            );
          })}
          {orders?.length === 0 && <p className="text-sm text-neutral-500">No orders yet.</p>}
        </div>
      )}
    </div>
  );
}
