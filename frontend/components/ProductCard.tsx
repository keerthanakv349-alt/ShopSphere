"use client";

import Image from "next/image";
import Link from "next/link";
import { getMediaUrl } from "@/lib/media";
import { calculateDiscountedPrice, formatINR } from "@/lib/price";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  const discounted = calculateDiscountedPrice(product.base_price, product.discount_percentage);
  const hasDiscount = parseFloat(product.discount_percentage) > 0;
  const imageUrl = getMediaUrl(product.primary_image_url);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded border border-outline-variant bg-surface-container-lowest transition hover:shadow-md dark:border-neutral-800"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container dark:bg-neutral-900">
        {imageUrl ? (
          <Image
            // getMediaUrl handles both a relative backend /media/... path
            // and an already-absolute URL (seed data, future CDN) — see
            // lib/media.ts for why the naive prefix-always approach broke.
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-label-sm text-neutral-400">
            No image
          </div>
        )}
        {product.is_featured && (
          <span className="absolute left-0 top-3 bg-surface-container-lowest px-2 py-1 text-label-bold uppercase text-on-surface">
            New
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded bg-success/10 px-1.5 py-0.5 text-label-bold text-success">
            -{parseFloat(product.discount_percentage)}%
          </span>
        )}
      </div>
      <div className="p-sm">
        <p className="truncate text-label-bold uppercase text-on-surface-variant">{product.brand.name}</p>
        <p className="truncate text-body-md text-on-surface">{product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-body-md font-bold text-on-surface">{formatINR(discounted)}</span>
          {hasDiscount && (
            <span className="text-label-sm text-outline line-through">
              {formatINR(parseFloat(product.base_price))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
