




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

  // Calculate order status counts from recent orders
  const orderStatusCounts =
    data?.recent_orders.reduce(
      (acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {}
    ) || {};

  // Calculate product quantities sold from recent orders
  const productSales =
    data?.recent_orders.reduce(
      (acc: Record<string, number>, order) => {
        order.items.forEach((item) => {
          acc[item.product_name] =
            (acc[item.product_name] || 0) + item.quantity;
        });

        return acc;
      },
      {}
    ) || {};

  // Get top 5 products
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (isLoading) {
    return <p className="text-sm">Loading analytics...</p>;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <h1 className="text-3xl font-bold">
        Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">
            Total Revenue
          </h2>

          <p className="mt-2 text-3xl font-bold">
            ₹{Number(data?.total_revenue).toLocaleString()}
          </p>
        </div>

        {/* Orders */}
        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">
            Orders
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {data?.total_orders}
          </p>
        </div>

        {/* Customers */}
        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">
            Customers
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {data?.total_customers}
          </p>
        </div>

        {/* Products */}
        <div className="rounded-lg border p-6">
          <h2 className="text-sm text-neutral-500">
            Products
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {data?.total_products}
          </p>
        </div>
      </div>

      {/* Low Stock */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Low Stock Products
        </h2>

        <p className="text-5xl font-bold text-red-600">
          {data?.low_stock_variant_count}
        </p>
      </div>

      {/* Order Status */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Order Status
        </h2>

        {Object.keys(orderStatusCounts).length === 0 ? (
          <p className="text-sm text-neutral-500">
            No order status data available.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {Object.entries(orderStatusCounts).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="rounded-lg border p-4"
                >
                  <p className="text-sm capitalize text-neutral-500">
                    {status.replace(/_/g, " ")}
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {count}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Top Products
        </h2>

        {topProducts.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No product sales data available.
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.map(
              ([productName, quantity], index) => (
                <div
                  key={productName}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      #{index + 1}
                    </span>

                    <span className="font-medium">
                      {productName}
                    </span>
                  </div>

                  <span className="font-semibold">
                    {quantity} sold
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Recent Orders
        </h2>

        <div className="space-y-3">
          {data?.recent_orders.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No recent orders available.
            </p>
          ) : (
            data?.recent_orders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between rounded border p-3"
              >
                <div>
                  <p className="font-semibold">
                    {order.order_number}
                  </p>

                  <p className="text-sm text-neutral-500">
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    ₹
                    {Number(
                      order.total_amount
                    ).toLocaleString()}
                  </p>

                  <p className="text-sm capitalize">
                    {order.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}