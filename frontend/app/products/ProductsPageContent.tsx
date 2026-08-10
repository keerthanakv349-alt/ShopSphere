"use client";

/**
 * WHY FILTERS LIVE IN THE URL (useSearchParams) INSTEAD OF LOCAL STATE:
 * If filter state lived in useState, refreshing the page or sharing the
 * URL with someone would lose "category=footwear&sort=price_asc" — back/
 * forward browser navigation wouldn't work either. Keeping filters in the
 * URL (?category=...&brand=...&sort=...) makes every filtered view
 * bookmarkable, shareable, and back-button-friendly — standard practice
 * for any e-commerce listing page.
 */
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { ErrorState } from "@/components/ErrorState";
import { fetchBrands, fetchCategories, fetchProducts } from "@/lib/catalog";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "featured", label: "Featured" },
] as const;

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const sort = (searchParams.get("sort") as (typeof SORT_OPTIONS)[number]["value"]) ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page"); // any filter change resets pagination
      router.push(`/products?${next.toString()}`);
    },
    [router, searchParams]
  );

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: brands } = useQuery({ queryKey: ["brands"], queryFn: fetchBrands });
  const { data: products, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products", { category, brand, q, sort, page }],
    queryFn: () => fetchProducts({ category, brand, q, sort, page, page_size: 20 }),
  });

  return (
    <main className="mx-auto max-w-container-max px-gutter py-lg">
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-heading text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
          All Products
        </h1>
        <SearchBox initialQuery={q} onSearch={(query) => updateParam("q", query)} />
      </div>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-lg">
          <div>
            <h2 className="mb-2 text-label-bold uppercase text-on-surface-variant">Category</h2>
            <ul className="flex flex-col gap-2 text-body-md">
              <li>
                <button
                  onClick={() => updateParam("category", null)}
                  className={!category ? "font-medium text-brand" : "text-on-surface-variant"}
                >
                  All
                </button>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => updateParam("category", c.slug)}
                    className={category === c.slug ? "font-medium text-brand" : "text-on-surface-variant"}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-label-bold uppercase text-on-surface-variant">Brand</h2>
            <ul className="flex flex-col gap-2 text-body-md">
              <li>
                <button
                  onClick={() => updateParam("brand", null)}
                  className={!brand ? "font-medium text-brand" : "text-on-surface-variant"}
                >
                  All
                </button>
              </li>
              {brands?.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => updateParam("brand", b.slug)}
                    className={brand === b.slug ? "font-medium text-brand" : "text-on-surface-variant"}
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section>
          <div className="mb-md flex items-center justify-between">
            <p className="text-body-md text-on-surface-variant">
              {products ? `${products.total} products` : "Loading…"}
            </p>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-body-md text-on-surface focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded bg-surface-container" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : products && products.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">
                {products.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {products.total_pages > 1 && (
                <div className="mt-xl flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam("page", String(page - 1))}
                    className="rounded border border-outline-variant px-3 py-1.5 text-body-md disabled:opacity-40 dark:border-neutral-700"
                  >
                    Previous
                  </button>
                  <span className="text-body-md text-on-surface-variant">
                    Page {products.page} of {products.total_pages}
                  </span>
                  <button
                    disabled={page >= products.total_pages}
                    onClick={() => updateParam("page", String(page + 1))}
                    className="rounded border border-outline-variant px-3 py-1.5 text-body-md disabled:opacity-40 dark:border-neutral-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="py-16 text-center text-body-md text-on-surface-variant">No products match your filters.</p>
          )}
        </section>
      </div>
    </main>
  );
}
