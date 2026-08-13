

"use client";

/**
 * Client Component: the hero/category rail are static marketing content,
 * but "New Arrivals" pulls live data from the catalog API (react-query),
 * so the whole page renders client-side rather than splitting into a
 * server shell + client island — simplest correct option for a storefront
 * home page of this size.
 */

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ProductCard } from "@/components/ProductCard";
import { ErrorState } from "@/components/ErrorState";
import {
  fetchCategories,
  fetchProducts,
  fetchActiveBanners,
} from "@/lib/catalog";
import { useAuthStore } from "@/lib/auth-store";

export default function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });


  const {
  data: banners,
  isLoading: bannersLoading,
} = useQuery({
  queryKey: ["banners"],
  queryFn: fetchActiveBanners,
});


  /*
   * Get the currently logged-in user.
   *
   * If user exists:
   *   - User is logged in
   *   - "New here?" section should NOT be displayed
   *
   * If user is null:
   *   - User is logged out
   *   - "New here?" section can be displayed
   */
  const user = useAuthStore((state) => state.user);

  console.log("Current User:", user);

  // Featured products
  const {
    data: featured,
    isLoading: featuredLoading,
    isError: featuredError,
    error: featuredErrorObj,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ["products", { sort: "featured", page_size: 8 }],
    queryFn: () =>
      fetchProducts({
        sort: "featured",
        page_size: 8,
      }),
  });

  // New arrivals
  const {
    data: newArrivals,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", { sort: "newest", page_size: 8 }],
    queryFn: () =>
      fetchProducts({
        sort: "newest",
        page_size: 8,
      }),
  });

  return (
    <main className="mx-auto max-w-container-max px-gutter py-lg">

      {/* =========================================================
          HERO
      ========================================================= */}
      {/* 

      {/* Dynamic Banner */}
{bannersLoading ? (
  <section className="h-[280px] animate-pulse rounded bg-surface-container" />
) : banners && banners.length > 0 ? (
  <section className="relative overflow-hidden rounded">
    <img
      src={banners[0].image_url}
      alt={banners[0].title}
      className="h-[280px] w-full object-cover md:h-[360px]"
    />

    <div className="absolute inset-0 bg-black/40" />

    <div className="absolute inset-0 flex items-center">
      <div className="px-lg text-white md:px-xl">
        <h1 className="max-w-lg font-heading text-headline-lg-mobile font-bold md:text-headline-lg">
          {banners[0].title}
        </h1>

        {banners[0].subtitle && (
          <p className="mt-2 max-w-md text-body-lg text-white/90">
            {banners[0].subtitle}
          </p>
        )}

        {banners[0].link_url && (
          <Link
            href={banners[0].link_url}
            className="mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-body-md font-bold text-brand transition hover:bg-white/90"
          >
            Shop Now
          </Link>
        )}
      </div>
    </div>
  </section>
) : null}

      {/* =========================================================
          NEW HERE SECTION
          
          IMPORTANT:
          This section is displayed ONLY when the user is NOT logged in.
          
          Logged in:
            user !== null  -> section hidden
          
          Logged out:
            user === null  -> section shown
      ========================================================= */}
      {!user && (
        <section className="mt-xl flex flex-col items-center gap-sm rounded border border-outline-variant bg-surface-container-lowest px-lg py-xl text-center">

          <h2 className="font-heading text-headline-md text-on-surface">
            New here?
          </h2>

          <p className="max-w-md text-body-md text-on-surface-variant">
            Create an account to track orders, save favorites, and check out
            faster.
          </p>

          <div className="mt-1 flex gap-sm">

            <Link
              href="/signup"
              className="rounded-lg bg-brand px-5 py-2.5 text-body-md font-medium text-white transition hover:bg-brand-dark"
            >
              Sign up
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-outline-variant px-5 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container"
            >
              Log in
            </Link>

          </div>
        </section>
      )}


      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section className="mt-xl">

        <div className="mb-sm flex items-center justify-between">

          <h2 className="font-heading text-headline-md text-on-surface">
            Featured
          </h2>

          <Link
            href="/products?sort=featured"
            className="text-body-md font-medium text-brand hover:underline"
          >
            View All
          </Link>

        </div>


        {featuredLoading ? (

          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded bg-surface-container"
              />
            ))}
          </div>

        ) : featuredError ? (

          <ErrorState
            error={featuredErrorObj}
            onRetry={refetchFeatured}
          />

        ) : featured && featured.items.length > 0 ? (

          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">

            {featured.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          <p className="py-lg text-center text-body-md text-on-surface-variant">
            No featured products right now — check back soon.
          </p>

        )}

      </section>


      {/* =========================================================
          NEW ARRIVALS
      ========================================================= */}
      <section className="mt-xl">

        <div className="mb-sm flex items-center justify-between">

          <h2 className="font-heading text-headline-md text-on-surface">
            New Arrivals
          </h2>

          <Link
            href="/products?sort=newest"
            className="text-body-md font-medium text-brand hover:underline"
          >
            View All
          </Link>

        </div>


        {isLoading ? (

          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">

            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded bg-surface-container"
              />
            ))}

          </div>

        ) : isError ? (

          <ErrorState
            error={error}
            onRetry={refetch}
          />

        ) : newArrivals && newArrivals.items.length > 0 ? (

          <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">

            {newArrivals.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        ) : (

          <p className="py-lg text-center text-body-md text-on-surface-variant">
            No products yet — check back soon.
          </p>

        )}

      </section>

    </main>
  );
}