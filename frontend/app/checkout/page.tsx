"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { checkout, createAddress, fetchAddresses, fetchCart } from "@/lib/cart";
import { ProtectedRoute } from "@/lib/protected-route";
import { formatINR } from "@/lib/price";

const addressSchema = z.object({
  full_name: z.string().min(2, "Required"),
  phone_number: z.string().min(6, "Enter a valid phone number"),
  line1: z.string().min(3, "Required"),
  line2: z.string().optional(),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  postal_code: z.string().min(3, "Required"),
});
type AddressFormValues = z.infer<typeof addressSchema>;

const SHIPPING_CHARGE = "50.00";

function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const { data: cart } = useQuery({ queryKey: ["cart"], queryFn: fetchCart });
  const { data: addresses } = useQuery({ queryKey: ["addresses"], queryFn: fetchAddresses });

  // Default to the first saved address once addresses load; if the
  // customer has none yet, open the "add address" form automatically
  // instead of showing an empty, dead-end checkout page.
  useEffect(() => {
    if (!addresses) return;
    if (addresses.length === 0) {
      setShowNewAddressForm(true);
    } else if (!selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddressId(address.id);
      setShowNewAddressForm(false);
      reset();
      toast.success("Address saved");
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => checkout(selectedAddressId as string, SHIPPING_CHARGE),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed!");
      router.push(`/orders/${order.id}`);
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Checkout failed. Please try again.");
    },
  });

  if (!cart || cart.items.length === 0) {
    return <p className="p-16 text-center text-sm text-neutral-500">Your cart is empty.</p>;
  }

  const estimatedTotal = parseFloat(cart.total) + parseFloat(SHIPPING_CHARGE);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold">Shipping Address</h2>
        <div className="flex flex-col gap-2">
          {addresses?.map((address) => (
            <label
              key={address.id}
              className={`flex cursor-pointer flex-col rounded-lg border p-3 text-sm ${
                selectedAddressId === address.id
                  ? "border-brand"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={selectedAddressId === address.id}
                  onChange={() => setSelectedAddressId(address.id)}
                />
                <span className="font-medium">{address.full_name}</span>
                <span className="text-xs text-neutral-500">{address.label}</span>
              </div>
              <p className="ml-6 text-neutral-500">
                {address.line1}, {address.line2 ? `${address.line2}, ` : ""}
                {address.city}, {address.state} {address.postal_code}
              </p>
            </label>
          ))}
        </div>

        {showNewAddressForm ? (
          <form
            onSubmit={handleSubmit((values) => createAddressMutation.mutate(values))}
            className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-2 dark:border-neutral-800"
          >
            <div>
              <input
                {...register("full_name")}
                placeholder="Full name"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>
            <div>
              <input
                {...register("phone_number")}
                placeholder="Phone number"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-500">{errors.phone_number.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <input
                {...register("line1")}
                placeholder="Address line 1"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {errors.line1 && <p className="mt-1 text-xs text-red-500">{errors.line1.message}</p>}
            </div>
            <input
              {...register("line2")}
              placeholder="Address line 2 (optional)"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <div>
              <input
                {...register("city")}
                placeholder="City"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div>
              <input
                {...register("state")}
                placeholder="State"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
            </div>
            <div>
              <input
                {...register("postal_code")}
                placeholder="Postal code"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              {errors.postal_code && (
                <p className="mt-1 text-xs text-red-500">{errors.postal_code.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={createAddressMutation.isPending}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white sm:col-span-2"
            >
              {createAddressMutation.isPending ? "Saving…" : "Save address"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowNewAddressForm(true)}
            className="mt-3 text-sm text-brand hover:underline"
          >
            + Add a new address
          </button>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-3 text-sm font-semibold">Order Total</h2>
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal (after discount)</span>
            <span>{formatINR(parseFloat(cart.total))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Shipping</span>
            <span>{formatINR(parseFloat(SHIPPING_CHARGE))}</span>
          </div>
          <p className="text-xs text-neutral-400">GST is calculated per item on the confirmed order.</p>
          <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 font-semibold dark:border-neutral-800">
            <span>Estimated Total</span>
            <span>{formatINR(estimatedTotal)}</span>
          </div>
        </div>

        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={!selectedAddressId || checkoutMutation.isPending}
          className="mt-4 w-full rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {checkoutMutation.isPending ? "Placing order…" : "Place Order"}
        </button>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
