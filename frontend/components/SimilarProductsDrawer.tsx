"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSimilarProducts } from "@/lib/engagement";
import { getMediaUrl } from "@/lib/media";
import { calculateDiscountedPrice, formatINR } from "@/lib/price";
import type { Product } from "@/types/catalog";

/**
 * Myntra-style "View Similar" panel: slides in from the right over the page.
 *
 * Rendered through a portal to <body> so it isn't clipped by the product
 * grid's overflow or stacked underneath the next row of cards — which is
 * what happened when this was an absolutely-positioned popup inside the card.
 */
export function SimilarProductsDrawer({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { data: similarProducts = [], isLoading, isError } = useQuery({
    queryKey: ["similar-products", product.slug],
    queryFn: () => fetchSimilarProducts(product.slug),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const sourceImage = getMediaUrl(product.primary_image_url);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-label="Similar products">
      <button
        type="button"
        aria-label="Close similar products"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-neutral-950">
        <header className="flex items-center gap-3 border-b border-outline-variant p-4 dark:border-neutral-800">
          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-surface-container dark:bg-neutral-900">
            {sourceImage && (
              <Image src={sourceImage} alt={product.name} fill className="object-cover" sizes="44px" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-on-surface">Similar Products</p>
            <p className="truncate text-label-sm text-on-surface-variant">
              {product.brand.name} · {product.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-lg leading-none text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] rounded bg-surface-container dark:bg-neutral-900" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-surface-container dark:bg-neutral-900" />
                  <div className="mt-1 h-3 w-1/3 rounded bg-surface-container dark:bg-neutral-900" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">
              Couldn&apos;t load similar products. Please try again.
            </p>
          ) : similarProducts.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">No similar products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {similarProducts.map((similar) => (
                <SimilarTile key={similar.id} product={similar} onNavigate={onClose} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}

function SimilarTile({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  const image = getMediaUrl(product.primary_image_url);
  const discounted = calculateDiscountedPrice(product.base_price, product.discount_percentage);
  const hasDiscount = parseFloat(product.discount_percentage) > 0;
  const isOutOfStock = product.total_stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={onNavigate}
      className="group block overflow-hidden rounded border border-outline-variant transition hover:shadow-md dark:border-neutral-800"
    >
      <div className="relative aspect-[4/5] bg-surface-container dark:bg-neutral-900">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className={`object-cover transition group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
            sizes="200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-label-sm text-neutral-400">No image</div>
        )}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute right-1.5 top-1.5 rounded bg-success/10 px-1 py-0.5 text-[11px] font-bold text-success">
            -{parseFloat(product.discount_percentage)}%
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-[11px] font-bold uppercase text-on-surface-variant">{product.brand.name}</p>
        <p className="truncate text-xs text-on-surface">{product.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-bold text-on-surface">{formatINR(discounted)}</span>
          {hasDiscount && (
            <span className="text-[11px] text-outline line-through">
              {formatINR(parseFloat(product.base_price))}
            </span>
          )}
        </div>
        {isOutOfStock && <p className="mt-0.5 text-[11px] text-on-surface-variant">Out of stock</p>}
      </div>
    </Link>
  );
}
