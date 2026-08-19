"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";

import { fetchWishlist, removeFromWishlist } from "@/lib/wishlist";
import { ProtectedRoute } from "@/lib/protected-route";
import { formatINR } from "@/lib/price";

function WishlistContent() {
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,

    onSuccess: () => {
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },

    onError: () => {
      toast.error("Could not remove item");
    },
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-center text-sm text-neutral-500">
          Loading wishlist...
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-lg border border-neutral-200 p-8 text-center dark:border-neutral-800">
          <h1 className="text-xl font-semibold">
            Could not load wishlist
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Something went wrong while loading your wishlist.
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Products you have saved for later
          </p>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="text-6xl">♡</div>

          <h2 className="mt-4 text-xl font-semibold">
            Your wishlist is empty
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Save products you love and find them here later.
          </p>

          <Link
            href="/products"
            className="mt-6 rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>

        <p className="mt-1 text-sm text-neutral-500">
          {wishlist.length}{" "}
          {wishlist.length === 1 ? "product" : "products"} saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((item) => {
          const product = item.product;

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-neutral-800 dark:bg-neutral-950"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[4/5] bg-neutral-100">
                  {product.primary_image_url ? (
                    <img
                      src={product.primary_image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h2 className="font-medium hover:text-brand">
                    {product.name}
                  </h2>
                </Link>

                <p className="mt-2 font-semibold">
                  {formatINR(parseFloat(product.base_price))}
                </p>

                {parseFloat(product.discount_percentage) > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    {product.discount_percentage}% off
                  </p>
                )}

                <button
                  onClick={() => removeMutation.mutate(product.id)}
                  disabled={removeMutation.isPending}
                  className="mt-4 w-full rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900"
                >
                  {removeMutation.isPending
                    ? "Removing..."
                    : "Remove from Wishlist"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}