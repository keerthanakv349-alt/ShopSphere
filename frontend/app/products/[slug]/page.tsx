"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiHeart } from "react-icons/fi";

import { addCartItem } from "@/lib/cart";
import { fetchProductBySlug } from "@/lib/catalog";
import { getMediaUrl } from "@/lib/media";
import { calculateDiscountedPrice, formatINR } from "@/lib/price";
import { getStockLabel } from "@/lib/stock";
import { useAuthStore } from "@/lib/auth-store";

import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "@/lib/wishlist";

import { recordRecentlyViewed } from "@/lib/recently-viewed";

import { ProductReviews } from "@/components/ProductReviews";

import {
  RelatedProducts,
  FrequentlyBoughtTogether,
} from "@/components/ProductRecommendations";

import { RecentlyViewed } from "@/components/RecentlyViewed";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((s) => !!s.tokens);

  /*
   * ---------------------------------------------------------
   * PRODUCT
   * ---------------------------------------------------------
   */

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => fetchProductBySlug(params.slug),
  });

  /*
   * ---------------------------------------------------------
   * WISHLIST
   * ---------------------------------------------------------
   */

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });

  /*
   * Check whether this product is already in wishlist.
   */

  const isWishlisted = wishlist.some(
    (item) => item.product.id === product?.id
  );

  /*
   * ---------------------------------------------------------
   * PRODUCT VARIANTS
   * ---------------------------------------------------------
   */

  const sizes = useMemo(
    () =>
      [
        ...new Set(
          product?.variants
            .map((v) => v.size)
            .filter(Boolean)
        ),
      ] as string[],
    [product]
  );

  const colors = useMemo(
    () =>
      [
        ...new Set(
          product?.variants
            .map((v) => v.color)
            .filter(Boolean)
        ),
      ] as string[],
    [product]
  );

  const [selectedSize, setSelectedSize] =
    useState<string | null>(null);

  const [selectedColor, setSelectedColor] =
    useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);

  /*
   * Find the currently selected product variant.
   */

  const selectedVariant = product?.variants.find(
    (v) =>
      (sizes.length === 0 || v.size === selectedSize) &&
      (colors.length === 0 || v.color === selectedColor)
  );

  /*
   * ---------------------------------------------------------
   * RECENTLY VIEWED
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!product) return;

    recordRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: product.base_price,
      discount_percentage: product.discount_percentage,
      status: product.status,
      is_featured: product.is_featured,
      is_trending: product.is_trending,
      category: product.category,
      brand: product.brand,
      primary_image_url:
        product.images[0]?.image_url ?? null,
      total_stock: product.total_stock,
    });

    // Runs once whenever a different product is loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  /*
   * ---------------------------------------------------------
   * ADD TO CART
   * ---------------------------------------------------------
   */

  const addToCartMutation = useMutation({
    mutationFn: (variantId: string) =>
      addCartItem(variantId, 1),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      toast.success(
        `Added ${product?.name ?? "item"} to cart`
      );
    },

    onError: () => {
      toast.error(
        "Couldn't add this item to your cart. Please try again."
      );
    },
  });

  /*
   * ---------------------------------------------------------
   * ADD / REMOVE WISHLIST
   * ---------------------------------------------------------
   */

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) {
        throw new Error("Product not available");
      }

      if (isWishlisted) {
        await removeFromWishlist(product.id);
        return "removed";
      }

      await addToWishlist(product.id);
      return "added";
    },

    onSuccess: (action) => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });

      if (action === "added") {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    },

    onError: () => {
      toast.error(
        "Unable to update wishlist. Please try again."
      );
    },
  });

  /*
   * ---------------------------------------------------------
   * LOADING / ERROR
   * ---------------------------------------------------------
   */

  if (isLoading) {
    return (
      <p className="p-16 text-center text-sm text-neutral-500">
        Loading…
      </p>
    );
  }

  if (isError || !product) {
    return notFound();
  }

  /*
   * Product is guaranteed to exist after the check above.
   */

  const currentProduct = product;

  /*
   * ---------------------------------------------------------
   * PRICE
   * ---------------------------------------------------------
   */

  const effectivePrice = calculateDiscountedPrice(
    selectedVariant?.price_override ??
      product.base_price,
    product.discount_percentage
  );

  /*
   * ---------------------------------------------------------
   * PER-OPTION STOCK
   *
   * A size/color button can have every matching variant sold out
   * while other combinations still have stock — flag those specific
   * buttons instead of only warning after a variant is fully picked.
   * ---------------------------------------------------------
   */

  function stockForSize(size: string): number {
    return currentProduct.variants
      .filter(
        (v) =>
          v.size === size &&
          (colors.length === 0 || !selectedColor || v.color === selectedColor)
      )
      .reduce((sum, v) => sum + v.stock_quantity, 0);
  }

  function stockForColor(color: string): number {
    return currentProduct.variants
      .filter(
        (v) =>
          v.color === color &&
          (sizes.length === 0 || !selectedSize || v.size === selectedSize)
      )
      .reduce((sum, v) => sum + v.stock_quantity, 0);
  }

  /*
   * ---------------------------------------------------------
   * ADD TO CART
   * ---------------------------------------------------------
   */

  function handleAddToCart() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (
      (sizes.length > 0 && !selectedSize) ||
      (colors.length > 0 && !selectedColor)
    ) {
      toast.error(
        "Please select a size and color"
      );
      return;
    }

    if (
      !selectedVariant ||
      selectedVariant.stock_quantity === 0
    ) {
      toast.error("This variant is out of stock");
      return;
    }

    addToCartMutation.mutate(
      selectedVariant.id
    );
  }

  /*
   * ---------------------------------------------------------
   * WISHLIST
   * ---------------------------------------------------------
   */

  function handleWishlist() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    wishlistMutation.mutate();
  }

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <main className="mx-auto max-w-5xl px-gutter py-lg">

      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">

        {/* =====================================================
            PRODUCT IMAGES
        ===================================================== */}

        <div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-surface-container dark:bg-neutral-900">

            {product.images[activeImage] ? (
              <Image
                src={
                  getMediaUrl(
                    product.images[activeImage]
                      .image_url
                  )!
                }
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-body-md text-neutral-400">
                No image available
              </div>
            )}

          </div>

          {/* IMAGE THUMBNAILS */}

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">

              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() =>
                    setActiveImage(i)
                  }
                  className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                    i === activeImage
                      ? "border-brand"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={
                      getMediaUrl(
                        img.image_url
                      )!
                    }
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ))}

            </div>
          )}

        </div>

        {/* =====================================================
            PRODUCT INFORMATION
        ===================================================== */}

        <div>

          {/* BRAND */}

          <p className="text-label-bold uppercase text-on-surface-variant">
            {product.brand.name}
          </p>

          {/* PRODUCT NAME */}

          <h1 className="font-heading text-headline-lg-mobile font-bold text-on-surface">
            {product.name}
          </h1>

          {/* PRICE */}

          <div className="mt-3 flex items-center gap-2">

            <span className="text-headline-md font-bold text-brand">
              {formatINR(effectivePrice)}
            </span>

            {parseFloat(
              product.discount_percentage
            ) > 0 && (
              <>
                <span className="text-body-md text-outline line-through">
                  {formatINR(
                    parseFloat(
                      selectedVariant?.price_override ??
                        product.base_price
                    )
                  )}
                </span>

                <span className="rounded bg-success/10 px-1.5 py-0.5 text-label-bold text-success">
                  -
                  {parseFloat(
                    product.discount_percentage
                  )}
                  %
                </span>
              </>
            )}

          </div>

          <p className="mt-1 text-label-sm text-on-surface-variant">
            Inclusive of {product.gst_percentage}% GST
          </p>

          {/* =================================================
              COLOR
          ================================================= */}

          {colors.length > 0 && (
            <div className="mt-6">

              <p className="mb-2 text-label-bold uppercase text-on-surface-variant">
                Color
              </p>

              <div className="flex flex-wrap gap-2">

                {colors.map((color) => {
                  const outOfStock = stockForColor(color) === 0;
                  return (
                    <button
                      key={color}
                      onClick={() =>
                        setSelectedColor(color)
                      }
                      title={
                        outOfStock
                          ? `${color} — out of stock`
                          : undefined
                      }
                      className={`rounded-lg border px-3 py-1.5 text-body-md ${
                        selectedColor === color
                          ? "border-brand text-brand"
                          : "border-outline-variant dark:border-neutral-700"
                      } ${
                        outOfStock
                          ? "text-on-surface-variant opacity-50 line-through"
                          : ""
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}

              </div>

            </div>
          )}

          {/* =================================================
              SIZE
          ================================================= */}

          {sizes.length > 0 && (
            <div className="mt-4">

              <div className="mb-2 flex items-center justify-between">

                <p className="text-label-bold uppercase text-on-surface-variant">
                  Select Size
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                {sizes.map((size) => {
                  const outOfStock = stockForSize(size) === 0;
                  return (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      title={
                        outOfStock
                          ? `${size} — out of stock`
                          : undefined
                      }
                      className={`rounded-lg border px-3 py-1.5 text-body-md ${
                        selectedSize === size
                          ? "border-brand font-medium text-brand"
                          : "border-outline-variant dark:border-neutral-700"
                      } ${
                        outOfStock
                          ? "text-on-surface-variant opacity-50 line-through"
                          : ""
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}

              </div>

            </div>
          )}

          {/* =================================================
              STOCK
          ================================================= */}

          {selectedVariant && (
            <p
              className={`mt-3 text-label-sm font-medium ${
                selectedVariant.stock_quantity === 0
                  ? "text-on-surface-variant"
                  : selectedVariant.stock_quantity <= 5
                    ? "text-red-600"
                    : "text-success"
              }`}
            >
              {getStockLabel(selectedVariant.stock_quantity) ??
                `${selectedVariant.stock_quantity} in stock`}
            </p>
          )}

          {/* =================================================
              ADD TO BAG + WISHLIST
          ================================================= */}

          <div className="mt-6 flex gap-3">

            {/* ADD TO BAG */}

            <button
              onClick={handleAddToCart}
              disabled={
                addToCartMutation.isPending ||
                (!!selectedVariant &&
                  selectedVariant.stock_quantity === 0)
              }
              className="flex-1 rounded-lg bg-brand px-4 py-3 text-body-md font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addToCartMutation.isPending
                ? "Adding…"
                : selectedVariant?.stock_quantity === 0
                  ? "Out of Stock"
                  : "Add to Bag"}
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              onClick={handleWishlist}
              disabled={
                wishlistMutation.isPending
              }
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              title={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition ${
                isWishlisted
                  ? "border-brand bg-brand text-white"
                  : "border-outline-variant text-on-surface hover:border-brand hover:text-brand"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <FiHeart
                size={22}
                className={
                  isWishlisted
                    ? "fill-current"
                    : ""
                }
              />
            </button>

          </div>

          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          <div className="mt-8 border-t border-outline-variant pt-4 text-body-md text-on-surface-variant dark:border-neutral-800">

            <p className="mb-1 font-medium text-on-surface">
              Product details
            </p>

            <p>
              {product.description ||
                "No description available."}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          RECOMMENDATIONS
      ===================================================== */}

      <FrequentlyBoughtTogether
        slug={currentProduct.slug}
      />

      <ProductReviews
        productId={currentProduct.id}
      />

      <RelatedProducts
        slug={currentProduct.slug}
      />

      <RecentlyViewed
        excludeId={currentProduct.id}
      />

    </main>
  );
}