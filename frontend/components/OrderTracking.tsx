"use client";

/**
 * WHY AN EMBEDDED OpenStreetMap IFRAME, NOT A JS MAP LIBRARY:
 * The brief asks for live order tracking on a map (Google Maps or
 * OpenStreetMap). A full interactive map (Leaflet + tile layer + marker
 * icons + bundle size) is real added complexity for what this phase
 * needs: showing where the shipment currently is. OpenStreetMap's own
 * embed endpoint (no API key required, unlike Google Maps) does exactly
 * that — a bounded-box map with a marker — in a single iframe, zero new
 * dependencies. If richer interactivity were needed later (custom
 * styling, animated route lines, multiple markers), that's when
 * reaching for Leaflet would earn its cost.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchOrderTracking } from "@/lib/engagement";
import type { TrackingStatus } from "@/types/engagement";

const STATUS_LABELS: Record<TrackingStatus, string> = {
  order_packed: "Order Packed",
  shipped: "Shipped",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

function osmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.02;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function OrderTracking({ orderId }: { orderId: string }) {
  const { data: events } = useQuery({
    queryKey: ["tracking", orderId],
    queryFn: () => fetchOrderTracking(orderId),
  });

  if (!events || events.length === 0) return null;

  const latestWithLocation = [...events].reverse().find((e) => e.latitude != null && e.longitude != null);

  return (
    <section className="mb-6 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h2 className="mb-3 text-sm font-semibold">Shipment Tracking</h2>

      {latestWithLocation?.latitude != null && latestWithLocation?.longitude != null && (
        <iframe
          title="Shipment location"
          className="mb-4 h-56 w-full rounded-md border border-neutral-200 dark:border-neutral-800"
          src={osmEmbedUrl(latestWithLocation.latitude, latestWithLocation.longitude)}
        />
      )}

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3 text-sm">
            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
            <div>
              <p className="font-medium">{STATUS_LABELS[event.status]}</p>
              {event.location_label && <p className="text-neutral-500">{event.location_label}</p>}
              {event.delivery_partner && (
                <p className="text-xs text-neutral-400">
                  Courier: {event.delivery_partner.name} · {event.delivery_partner.phone_number}
                </p>
              )}
              <p className="text-xs text-neutral-400">{new Date(event.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
