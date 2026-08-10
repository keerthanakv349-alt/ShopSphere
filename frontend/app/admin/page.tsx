"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchDashboardSummary } from "@/lib/admin";
import { formatINR } from "@/lib/price";
import { ErrorState } from "@/components/ErrorState";

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const stats = [
    { label: "Total Revenue", value: formatINR(parseFloat(data.total_revenue)) },
    { label: "Total Orders", value: data.total_orders },
    { label: "Customers", value: data.total_customers },
    { label: "Active Products", value: data.total_products },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">{stat.label}</p>
            <p className="mt-1 text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {data.low_stock_variant_count > 0 && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
          <strong>{data.low_stock_variant_count}</strong> product variant(s) are low on stock (5 or fewer
          units). <Link href="/admin/products" className="underline">Review inventory →</Link>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold">Recent Orders</h2>
      <div className="flex flex-col gap-2">
        {data.recent_orders.length === 0 && <p className="text-sm text-neutral-500">No orders yet.</p>}
        {data.recent_orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
          >
            <div>
              <p className="font-medium">{order.order_number}</p>
              <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatINR(parseFloat(order.total_amount))}</p>
              <p className="text-xs text-neutral-500">{order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
