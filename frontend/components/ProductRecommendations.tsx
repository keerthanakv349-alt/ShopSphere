"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { fetchFrequentlyBoughtTogether, fetchRelatedProducts } from "@/lib/engagement";
import type { Product } from "@/types/catalog";

function ProductRow({
  title,
  queryKey,
  fetcher,
  slug,
}: {
  title: string;
  queryKey: string;
  fetcher: (slug: string) => Promise<Product[]>;
  slug: string;
}) {
  const { data: products } = useQuery({
    queryKey: [queryKey, slug],
    queryFn: () => fetcher(slug),
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function RelatedProducts({ slug }: { slug: string }) {
  return (
    <ProductRow title="You might also like" queryKey="related" fetcher={fetchRelatedProducts} slug={slug} />
  );
}

export function FrequentlyBoughtTogether({ slug }: { slug: string }) {
  return (
    <ProductRow
      title="Frequently bought together"
      queryKey="frequently-bought-together"
      fetcher={fetchFrequentlyBoughtTogether}
      slug={slug}
    />
  );
}
