"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { applyCoupon, fetchCart, removeCartItem, removeCoupon, updateCartItem } from "@/lib/cart";
import { getMediaUrl } from "@/lib/media";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";
import { formatINR } from "@/lib/price";

function CartContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [couponInput, setCouponInput] = useState("");

  const { data: cart, isLoading, isError, error, refetch } = useQuery({ queryKey: ["cart"], queryFn: fetchCart });

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const updateQtyMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: invalidateCart,
    onError: () => toast.error("Couldn't update quantity — check available stock."),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: invalidateCart,
  });

  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => applyCoupon(code),
    onSuccess: () => {
      invalidateCart();
      setCouponInput("");
      toast.success("Coupon applied");
    },
    onError: () => toast.error("Invalid or ineligible coupon code"),
  });

  const removeCouponMutation = useMutation({
    mutationFn: removeCoupon,
    onSuccess: invalidateCart,
  });

  if (isLoading) return <p className="p-16 text-center text-sm text-neutral-500">Loading…</p>;

  if (isError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <ErrorState error={error} onRetry={refetch} />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-gutter py-16 text-center">
        <h1 className="mb-2 font-heading text-headline-md font-bold text-on-surface">Your cart is empty</h1>
        <p className="mb-6 text-body-md text-on-surface-variant">Find something you love and add it to your cart.</p>
        <Link href="/products" className="rounded-lg bg-brand px-5 py-2.5 text-body-md font-medium text-white">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-gutter py-lg">
      <h1 className="mb-6 font-heading text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
        Your Cart
      </h1>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-md">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded border border-outline-variant bg-surface-container-lowest p-sm dark:border-neutral-800"
            >
              <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-surface-container dark:bg-neutral-900">
                {getMediaUrl(item.image_url) && (
                  <Image src={getMediaUrl(item.image_url)!} alt={item.product_name} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/products/${item.product_slug}`} className="text-body-md font-medium text-on-surface hover:text-brand">
                    {item.product_name}
                  </Link>
                  <p className="text-label-sm text-on-surface-variant">
                    {[item.color, item.size].filter(Boolean).join(" / ")}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQtyMutation.mutate({ itemId: item.id, quantity: Number(e.target.value) })
                      }
                      className="rounded border border-outline-variant px-2 py-1 text-body-md dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      {Array.from({ length: Math.min(item.stock_quantity, 10) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Qty {n}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItemMutation.mutate(item.id)}
                      className="text-label-sm text-on-surface-variant underline hover:text-brand"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-body-md font-bold text-on-surface">{formatINR(parseFloat(item.line_total))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded border border-outline-variant bg-surface-container-lowest p-md dark:border-neutral-800">
          <h2 className="mb-3 text-label-bold uppercase text-on-surface-variant">Order Summary</h2>

          {cart.applied_coupon_code ? (
            <div className="mb-3 flex items-center justify-between rounded bg-success/10 px-3 py-2 text-label-sm text-success">
              <span>
                Coupon <strong>{cart.applied_coupon_code}</strong> applied
              </span>
              <button onClick={() => removeCouponMutation.mutate()} className="text-on-surface-variant hover:text-brand">
                ✕
              </button>
            </div>
          ) : (
            <div className="mb-3 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 rounded border border-outline-variant px-2 py-1.5 text-body-md focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                onClick={() => couponInput && applyCouponMutation.mutate(couponInput)}
                disabled={applyCouponMutation.isPending}
                className="rounded border border-outline-variant px-3 py-1.5 text-body-md dark:border-neutral-700"
              >
                Apply
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1 text-body-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Subtotal</span>
              <span>{formatINR(parseFloat(cart.subtotal))}</span>
            </div>
            {parseFloat(cart.discount_amount) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatINR(parseFloat(cart.discount_amount))}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-outline-variant pt-2 font-bold text-on-surface dark:border-neutral-800">
              <span>Total</span>
              <span>{formatINR(parseFloat(cart.total))}</span>
            </div>
            <p className="text-label-sm text-on-surface-variant">Plus GST and shipping, calculated at checkout.</p>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-body-md font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </main>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
