"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import type { Product } from "@/types/catalog";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  // Read in an effect, not during render — localStorage doesn't exist
  // during server-side rendering, and reading it at render time would
  // cause a hydration mismatch between server and client output.
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getRecentlyViewed(excludeId));
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
