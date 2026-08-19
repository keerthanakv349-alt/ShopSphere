"use client";

/**
 * Product listing page.
 *
 * FEATURES:
 * - Search
 * - Category filtering
 * - Brand filtering
 * - Sorting
 * - Pagination
 * - Add/remove wishlist
 *
 * Wishlist is loaded only for authenticated users.
 *
 * The wishlist button is displayed on top of each product card.
 * The existing ProductCard component is kept unchanged.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { FiHeart } from "react-icons/fi";

import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import { ErrorState } from "@/components/ErrorState";

import {
  fetchBrands,
  fetchCategories,
  fetchProducts,
} from "@/lib/catalog";

import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/wishlist";

import { useAuthStore } from "@/lib/auth-store";


const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
  {
    value: "featured",
    label: "Featured",
  },
] as const;


/*
 * ============================================================
 * PRODUCT CARD WITH WISHLIST
 * ============================================================
 */

function ProductCardWithWishlist({
  product,
  isWishlisted,
  onToggleWishlist,
  isUpdating,
}: {
  product: any;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="relative">

      {/* Existing product card */}

      <ProductCard product={product} />

      {/* Wishlist button */}

      <button
        type="button"
        onClick={onToggleWishlist}
        disabled={isUpdating}
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
        className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 ${
          isWishlisted
            ? "border-brand text-brand"
            : "border-neutral-200 text-neutral-700 hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-300"
        }`}
      >
        <FiHeart
          size={19}
          className={
            isWishlisted
              ? "fill-current"
              : ""
          }
        />
      </button>

    </div>
  );
}


/*
 * ============================================================
 * MAIN PAGE
 * ============================================================
 */

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryClient = useQueryClient();

  /*
   * ----------------------------------------------------------
   * AUTH
   * ----------------------------------------------------------
   */

  const isAuthenticated = useAuthStore(
    (state) => !!state.tokens
  );


  /*
   * ----------------------------------------------------------
   * URL FILTERS
   * ----------------------------------------------------------
   */

  const category =
    searchParams.get("category") ?? undefined;

  const brand =
    searchParams.get("brand") ?? undefined;

  const q =
    searchParams.get("q") ?? undefined;

  const sort =
    (searchParams.get("sort") as
      (typeof SORT_OPTIONS)[number]["value"]) ??
    "newest";

  const page =
    Number(searchParams.get("page") ?? "1");


  /*
   * ----------------------------------------------------------
   * UPDATE URL PARAMETER
   * ----------------------------------------------------------
   *
   * Filters remain in the URL so:
   *
   * /products?category=footwear
   *
   * can be bookmarked/shared and browser
   * back/forward continues to work.
   */

  const updateParam = useCallback(
    (
      key: string,
      value: string | null
    ) => {
      const next =
        new URLSearchParams(
          searchParams.toString()
        );

      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }

      /*
       * Changing a filter starts from page 1.
       */

      if (key !== "page") {
        next.delete("page");
      }

      const queryString =
        next.toString();

      router.push(
        queryString
          ? `/products?${queryString}`
          : "/products"
      );
    },
    [router, searchParams]
  );


  /*
   * ----------------------------------------------------------
   * CATEGORIES
   * ----------------------------------------------------------
   */

  const {
    data: categories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });


  /*
   * ----------------------------------------------------------
   * BRANDS
   * ----------------------------------------------------------
   */

  const {
    data: brands,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });


  /*
   * ----------------------------------------------------------
   * PRODUCTS
   * ----------------------------------------------------------
   */

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      {
        category,
        brand,
        q,
        sort,
        page,
      },
    ],

    queryFn: () =>
      fetchProducts({
        category,
        brand,
        q,
        sort,
        page,
        page_size: 20,
      }),
  });


  /*
   * ----------------------------------------------------------
   * WISHLIST
   * ----------------------------------------------------------
   *
   * Only logged-in users have a server-side wishlist.
   *
   * Anonymous users will not make a wishlist request.
   */

  const {
    data: wishlist = [],
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });


  /*
   * ----------------------------------------------------------
   * WISHLIST MUTATION
   * ----------------------------------------------------------
   */

  const wishlistMutation =
    useMutation({
      mutationFn: async ({
        productId,
        currentlyWishlisted,
      }: {
        productId: string;
        currentlyWishlisted: boolean;
      }) => {
        if (currentlyWishlisted) {
          await removeFromWishlist(
            productId
          );

          return {
            productId,
            action: "removed" as const,
          };
        }

        await addToWishlist(
          productId
        );

        return {
          productId,
          action: "added" as const,
        };
      },

      /*
       * Refresh wishlist after successful
       * add/remove.
       */

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["wishlist"],
        });
      },
    });


  /*
   * ----------------------------------------------------------
   * CHECK WHETHER PRODUCT IS WISHLISTED
   * ----------------------------------------------------------
   */

  const isProductWishlisted = (
    productId: string
  ) => {
    return wishlist.some(
      (item) =>
        item.product.id === productId
    );
  };


  /*
   * ----------------------------------------------------------
   * HANDLE WISHLIST
   * ----------------------------------------------------------
   */

  const handleWishlist = (
    productId: string
  ) => {
    /*
     * If user is not logged in,
     * send them to login.
     */

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const currentlyWishlisted =
      isProductWishlisted(productId);

    wishlistMutation.mutate({
      productId,
      currentlyWishlisted,
    });
  };


  /*
   * ----------------------------------------------------------
   * PAGE UI
   * ----------------------------------------------------------
   */

  return (
    <main className="mx-auto max-w-container-max px-gutter py-lg">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">

        <h1 className="font-heading text-headline-lg-mobile font-bold text-on-surface md:text-headline-lg">
          All Products
        </h1>

        <SearchBox
          initialQuery={q}
          onSearch={(query) =>
            updateParam(
              "q",
              query
            )
          }
        />

      </div>


      {/* ====================================================
          CONTENT GRID
      ==================================================== */}

      <div className="grid grid-cols-1 gap-lg md:grid-cols-[200px_1fr]">


        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="flex flex-col gap-lg">


          {/* =================================================
              CATEGORY
          ================================================= */}

          <div>

            <h2 className="mb-2 text-label-bold uppercase text-on-surface-variant">
              Category
            </h2>

            <ul className="flex flex-col gap-2 text-body-md">

              {/* ALL */}

              <li>
                <button
                  onClick={() =>
                    updateParam(
                      "category",
                      null
                    )
                  }
                  className={
                    !category
                      ? "font-medium text-brand"
                      : "text-on-surface-variant"
                  }
                >
                  All
                </button>
              </li>


              {/* CATEGORY LIST */}

              {categories?.map(
                (c) => (
                  <li key={c.id}>

                    <button
                      onClick={() =>
                        updateParam(
                          "category",
                          c.slug
                        )
                      }
                      className={
                        category === c.slug
                          ? "font-medium text-brand"
                          : "text-on-surface-variant"
                      }
                    >
                      {c.name}
                    </button>

                  </li>
                )
              )}

            </ul>

          </div>


          {/* =================================================
              BRAND
          ================================================= */}

          <div>

            <h2 className="mb-2 text-label-bold uppercase text-on-surface-variant">
              Brand
            </h2>

            <ul className="flex flex-col gap-2 text-body-md">

              {/* ALL */}

              <li>

                <button
                  onClick={() =>
                    updateParam(
                      "brand",
                      null
                    )
                  }
                  className={
                    !brand
                      ? "font-medium text-brand"
                      : "text-on-surface-variant"
                  }
                >
                  All
                </button>

              </li>


              {/* BRAND LIST */}

              {brands?.map(
                (b) => (
                  <li key={b.id}>

                    <button
                      onClick={() =>
                        updateParam(
                          "brand",
                          b.slug
                        )
                      }
                      className={
                        brand === b.slug
                          ? "font-medium text-brand"
                          : "text-on-surface-variant"
                      }
                    >
                      {b.name}
                    </button>

                  </li>
                )
              )}

            </ul>

          </div>

        </aside>


        {/* ==================================================
            PRODUCT SECTION
        ================================================== */}

        <section>


          {/* =================================================
              PRODUCT COUNT + SORT
          ================================================= */}

          <div className="mb-md flex items-center justify-between">

            <p className="text-body-md text-on-surface-variant">
              {products
                ? `${products.total} products`
                : "Loading…"}
            </p>


            <select
              value={sort}
              onChange={(e) =>
                updateParam(
                  "sort",
                  e.target.value
                )
              }
              className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1.5 text-body-md text-on-surface focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >

              {SORT_OPTIONS.map(
                (opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                )
              )}

            </select>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading ? (

            <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">

              {Array.from({
                length: 8,
              }).map((_, i) => (

                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded bg-surface-container"
                />

              ))}

            </div>


          ) : isError ? (

            /* =================================================
               ERROR
            ================================================= */

            <ErrorState
              error={error}
              onRetry={refetch}
            />


          ) : products &&
            products.items.length > 0 ? (

            <>


              {/* =================================================
                  PRODUCT GRID
              ================================================= */}

              <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-4">

                {products.items.map(
                  (product) => {

                    const wishlisted =
                      isProductWishlisted(
                        product.id
                      );

                    const updating =
                      wishlistMutation.isPending &&
                      wishlistMutation.variables
                        ?.productId ===
                        product.id;

                    return (

                      <ProductCardWithWishlist
                        key={product.id}
                        product={product}
                        isWishlisted={
                          wishlisted
                        }
                        isUpdating={
                          updating
                        }
                        onToggleWishlist={() =>
                          handleWishlist(
                            product.id
                          )
                        }
                      />

                    );
                  }
                )}

              </div>


              {/* =================================================
                  PAGINATION
              ================================================= */}

              {products.total_pages > 1 && (

                <div className="mt-xl flex items-center justify-center gap-2">

                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      updateParam(
                        "page",
                        String(page - 1)
                      )
                    }
                    className="rounded border border-outline-variant px-3 py-1.5 text-body-md disabled:opacity-40 dark:border-neutral-700"
                  >
                    Previous
                  </button>


                  <span className="text-body-md text-on-surface-variant">
                    Page {products.page} of{" "}
                    {products.total_pages}
                  </span>


                  <button
                    disabled={
                      page >=
                      products.total_pages
                    }
                    onClick={() =>
                      updateParam(
                        "page",
                        String(page + 1)
                      )
                    }
                    className="rounded border border-outline-variant px-3 py-1.5 text-body-md disabled:opacity-40 dark:border-neutral-700"
                  >
                    Next
                  </button>

                </div>

              )}

            </>


          ) : (

            /* =================================================
               NO PRODUCTS
            ================================================= */

            <p className="py-16 text-center text-body-md text-on-surface-variant">
              No products match your filters.
            </p>

          )}

        </section>

      </div>

    </main>
  );
}