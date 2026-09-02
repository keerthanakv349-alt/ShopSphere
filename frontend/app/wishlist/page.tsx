"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { getMediaUrl } from "@/lib/media";
import { fetchWishlist, removeFromWishlist, type WishlistProduct } from "@/lib/wishlist";
import { fetchProductBySlug } from "@/lib/catalog";
import { addCartItem } from "@/lib/cart";
import { ProtectedRoute } from "@/lib/protected-route";
import { formatINR } from "@/lib/price";
import { getStockLabel } from "@/lib/stock";
import type { ProductVariant } from "@/types/catalog";

interface VariantPicker {
  product: WishlistProduct;
  variants: ProductVariant[];
  sizes: string[];
  colors: string[];
}

function WishlistContent() {
  const queryClient = useQueryClient();

  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [variantPicker, setVariantPicker] = useState<VariantPicker | null>(null);
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);

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

  async function addVariantToCart(
    variant: ProductVariant,
    productName: string
  ) {
    if (variant.stock_quantity === 0) {
      toast.error("This variant is out of stock");
      return;
    }

    try {
      await addCartItem(variant.id, 1);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Added ${productName} to cart`);
    } catch {
      toast.error(
        "Couldn't add this item to your cart. Please try again."
      );
    }
  }

  async function handleAddToCart(product: WishlistProduct) {
    setAddingProductId(product.id);

    try {
      const detail = await fetchProductBySlug(product.slug);
      const variants = detail.variants;

      if (variants.length === 0) {
        toast.error("This product is currently unavailable");
        return;
      }

      if (variants.length === 1) {
        await addVariantToCart(variants[0], product.name);
        return;
      }

      const sizes = [
        ...new Set(variants.map((v) => v.size).filter(Boolean)),
      ] as string[];

      const colors = [
        ...new Set(variants.map((v) => v.color).filter(Boolean)),
      ] as string[];

      setPickedSize(null);
      setPickedColor(null);
      setVariantPicker({ product, variants, sizes, colors });
    } catch {
      toast.error("Couldn't load this product. Please try again.");
    } finally {
      setAddingProductId(null);
    }
  }

  function stockForPickedSize(size: string): number {
    if (!variantPicker) return 0;
    return variantPicker.variants
      .filter(
        (v) =>
          v.size === size &&
          (variantPicker.colors.length === 0 || !pickedColor || v.color === pickedColor)
      )
      .reduce((sum, v) => sum + v.stock_quantity, 0);
  }

  function stockForPickedColor(color: string): number {
    if (!variantPicker) return 0;
    return variantPicker.variants
      .filter(
        (v) =>
          v.color === color &&
          (variantPicker.sizes.length === 0 || !pickedSize || v.size === pickedSize)
      )
      .reduce((sum, v) => sum + v.stock_quantity, 0);
  }

  function handleConfirmVariant() {
    if (!variantPicker) return;

    const { product, variants, sizes, colors } = variantPicker;

    if (
      (sizes.length > 0 && !pickedSize) ||
      (colors.length > 0 && !pickedColor)
    ) {
      toast.error("Please select a size and color");
      return;
    }

    const variant = variants.find(
      (v) =>
        (sizes.length === 0 || v.size === pickedSize) &&
        (colors.length === 0 || v.color === pickedColor)
    );

    if (!variant) {
      toast.error("This combination is not available");
      return;
    }

    setVariantPicker(null);
    addVariantToCart(variant, product.name);
  }

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
              {/* <Link href={`/products/${product.slug}`}>
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
              </Link> */}

<Link href={`/products/${product.slug}`}>
  <div className="relative aspect-[4/5] bg-neutral-100">
    {getMediaUrl(product.primary_image_url) ? (
      <img
        src={getMediaUrl(product.primary_image_url)!}
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

                {(() => {
                  const stockLabel = getStockLabel(product.total_stock);
                  if (!stockLabel) return null;
                  return (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        stockLabel === "Out of stock" ? "text-neutral-500" : "text-red-600"
                      }`}
                    >
                      {stockLabel}
                    </p>
                  );
                })()}

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingProductId === product.id || product.total_stock === 0}
                  className="mt-4 w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingProductId === product.id
                    ? "Adding..."
                    : product.total_stock === 0
                      ? "Out of Stock"
                      : "Add to Bag"}
                </button>

                <button
                  onClick={() => removeMutation.mutate(product.id)}
                  disabled={removeMutation.isPending}
                  className="mt-2 w-full rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900"
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

      {variantPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">
              {variantPicker.product.name}
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Select options to add this to your bag
            </p>

            {variantPicker.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variantPicker.sizes.map((size) => {
                    const outOfStock = stockForPickedSize(size) === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => setPickedSize(size)}
                        title={outOfStock ? `${size} — out of stock` : undefined}
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                          pickedSize === size
                            ? "border-brand bg-brand text-white"
                            : "border-neutral-300 dark:border-neutral-700"
                        } ${outOfStock ? "opacity-50 line-through" : ""}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {variantPicker.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variantPicker.colors.map((color) => {
                    const outOfStock = stockForPickedColor(color) === 0;
                    return (
                      <button
                        key={color}
                        onClick={() => setPickedColor(color)}
                        title={outOfStock ? `${color} — out of stock` : undefined}
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                          pickedColor === color
                            ? "border-brand bg-brand text-white"
                            : "border-neutral-300 dark:border-neutral-700"
                        } ${outOfStock ? "opacity-50 line-through" : ""}`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setVariantPicker(null)}
                className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmVariant}
                className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}
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