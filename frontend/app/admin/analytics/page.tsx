// export default function AdminAnalyticsPage() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Analytics</h1>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
//         <div className="rounded-lg border p-6">
//           <h2 className="text-sm text-gray-500">Total Revenue</h2>
//           <p className="mt-2 text-3xl font-bold">₹0</p>
//         </div>

//         <div className="rounded-lg border p-6">
//           <h2 className="text-sm text-gray-500">Orders</h2>
//           <p className="mt-2 text-3xl font-bold">0</p>
//         </div>

//         <div className="rounded-lg border p-6">
//           <h2 className="text-sm text-gray-500">Customers</h2>
//           <p className="mt-2 text-3xl font-bold">0</p>
//         </div>

//         <div className="rounded-lg border p-6">
//           <h2 className="text-sm text-gray-500">Products</h2>
//           <p className="mt-2 text-3xl font-bold">0</p>
//         </div>
//       </div>

//       <div className="rounded-lg border p-6">
//         <h2 className="text-xl font-semibold">
//           Sales Overview
//         </h2>

//         <div className="mt-4 h-80 rounded bg-gray-100 flex items-center justify-center">
//           Chart will be added here
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/lib/admin";
import { ErrorState } from "@/components/ErrorState";

export default function AdminAnalyticsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) {
    return <p className="text-sm">Loading analytics...</p>;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">Total Revenue</h2>
          <p className="mt-2 text-3xl font-bold">
            ₹{Number(data?.total_revenue).toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">Orders</h2>
          <p className="mt-2 text-3xl font-bold">
            {data?.total_orders}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">Customers</h2>
          <p className="mt-2 text-3xl font-bold">
            {data?.total_customers}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">Products</h2>
          <p className="mt-2 text-3xl font-bold">
            {data?.total_products}
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Low Stock Products
        </h2>

        <p className="text-5xl font-bold text-red-600">
          {data?.low_stock_variant_count}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Recent Orders
        </h2>

        <div className="space-y-3">
          {data?.recent_orders.map((order: any) => (
            <div
              key={order.id}
              className="flex justify-between rounded border p-3"
            >
              <div>
                <p className="font-semibold">
                  {order.order_number}
                </p>

                <p className="text-sm text-neutral-500">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold">
                  ₹{Number(order.total_amount).toLocaleString()}
                </p>

                <p className="text-sm capitalize">
                  {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}