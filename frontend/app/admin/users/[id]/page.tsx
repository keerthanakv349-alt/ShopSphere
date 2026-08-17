"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDetail } from "@/lib/admin";
import { ErrorState } from "@/components/ErrorState";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-customer", customerId],
    queryFn: () => fetchCustomerDetail(customerId),
    enabled: Boolean(customerId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-neutral-500">
          Loading customer...
        </p>
      </div>
    );
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!customer) {
    return (
      <div className="rounded-lg border p-6">
        <p className="text-neutral-500">
          Customer not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to Customers
          </Link>

          <h1 className="mt-2 text-3xl font-bold">
            {customer.full_name}
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            {customer.email}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
            customer.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {customer.is_active ? "Active" : "Blocked"}
        </span>
      </div>

      {/* Customer information */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-xl font-semibold">
          Customer Information
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-neutral-500">Full Name</p>
            <p className="mt-1 font-medium">
              {customer.full_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Email</p>
            <p className="mt-1 break-all font-medium">
              {customer.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">Phone</p>
            <p className="mt-1 font-medium">
              {customer.phone_number || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-neutral-500">
              Joined
            </p>
            <p className="mt-1 font-medium">
              {new Date(
                customer.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t pt-5">
          <p className="text-sm text-neutral-500">
            Email Verification
          </p>

          <p
            className={`mt-1 font-medium ${
              customer.is_email_verified
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            {customer.is_email_verified
              ? "Verified"
              : "Not verified"}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-neutral-500">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold">
            {customer.total_orders}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-neutral-500">
            Total Spend
          </p>

          <p className="mt-2 text-3xl font-bold">
            ₹{Number(customer.total_spend).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Addresses */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-xl font-semibold">
          Addresses
        </h2>

        {customer.addresses.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            No addresses saved.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {address.label}
                  </h3>

                  {address.is_default && (
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-sm text-neutral-600">
                  <p>{address.full_name}</p>
                  <p>{address.phone_number}</p>
                  <p>{address.line1}</p>

                  {address.line2 && (
                    <p>{address.line2}</p>
                  )}

                  <p>
                    {address.city}, {address.state}
                  </p>

                  <p>
                    {address.postal_code},{" "}
                    {address.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order history */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-xl font-semibold">
          Order History
        </h2>

        {customer.orders.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            No orders found.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {customer.orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {order.order_number}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {new Date(
                        order.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-bold">
                      ₹
                      {Number(
                        order.total_amount
                      ).toLocaleString()}
                    </p>

                    <span className="text-sm capitalize text-neutral-500">
                      {order.status.replaceAll(
                        "_",
                        " "
                      )}
                    </span>
                  </div>
                </div>

                {/* Order items */}
                <div className="mt-4 border-t pt-4">
                  <p className="mb-3 text-sm font-semibold">
                    Items
                  </p>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {item.product_name}
                          </p>

                          <p className="text-neutral-500">
                            SKU: {item.sku}
                            {item.size &&
                              ` • Size: ${item.size}`}
                            {item.color &&
                              ` • Color: ${item.color}`}
                          </p>
                        </div>

                        <p className="font-medium">
                          {item.quantity} × ₹
                          {Number(
                            item.unit_price
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}