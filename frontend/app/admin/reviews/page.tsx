"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { api } from "@/lib/api";

type AdminReview = {
  id: string;
  product_id: string;
  product_name: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  is_reported: boolean;
  created_at: string;
};

async function fetchAdminReviews(
  search?: string,
  rating?: number,
): Promise<AdminReview[]> {
  const params = new URLSearchParams();

  if (search?.trim()) {
    params.set("q", search.trim());
  }

  if (rating) {
    params.set("rating", String(rating));
  }

  const query = params.toString();

  const response = await api.get<AdminReview[]>(
    `/api/v1/admin/reviews${query ? `?${query}` : ""}`,
  );

  return response.data;
}

function renderStars(rating: number) {
  return (
    <span
      className="whitespace-nowrap text-sm"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminReviewsPage() {
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "reviews", search, rating],
    queryFn: () =>
      fetchAdminReviews(
        search || undefined,
        rating ? Number(rating) : undefined,
      ),
  });

  const errorMessage =
    error instanceof AxiosError
      ? error.response?.data?.detail ?? "Failed to load reviews"
      : "Failed to load reviews";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Reviews
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Manage and monitor customer reviews across your products.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, product, or review..."
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 sm:max-w-md"
        />

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-lg border border-neutral-200 p-6 text-center text-sm text-neutral-500 dark:border-neutral-800">
          Loading reviews...
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              refetch();
              toast.success("Retrying...");
            }}
            className="mt-3 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Reviews */}
      {!isLoading && !isError && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 md:block">
            <table className="min-w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Product
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Rating
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Review
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  >
                    {/* Customer */}
                    <td className="px-4 py-4 align-top">
                      <Link
                        href={`/admin/users/${review.customer_id}`}
                        className="font-medium text-neutral-900 hover:underline dark:text-white"
                      >
                        {review.customer_name}
                      </Link>

                      <p className="mt-1 text-xs text-neutral-500">
                        {review.customer_email}
                      </p>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-4 align-top">
                      <Link
                        href={`/admin/products/${review.product_id}/edit`}
                        className="font-medium text-neutral-900 hover:underline dark:text-white"
                      >
                        {review.product_name}
                      </Link>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        {renderStars(review.rating)}

                        <span className="text-xs text-neutral-500">
                          {review.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* Review */}
                    <td className="max-w-sm px-4 py-4 align-top">
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {review.title || "No title"}
                      </p>

                      <p className="mt-1 line-clamp-3 text-xs text-neutral-500">
                        {review.comment || "No comment"}
                      </p>

                      <p className="mt-2 text-xs text-neutral-400">
                        Helpful: {review.helpful_count}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        {review.is_verified_purchase ? (
                          <span className="w-fit rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                            Verified Purchase
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                            Not Verified
                          </span>
                        )}

                        {review.is_reported && (
                          <span className="w-fit rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                            Reported
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-4 align-top text-xs text-neutral-500">
                      {formatDate(review.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                {/* Customer + Product */}
                <div className="flex flex-col gap-3">
                  <div>
                    <Link
                      href={`/admin/users/${review.customer_id}`}
                      className="text-sm font-semibold text-neutral-900 hover:underline dark:text-white"
                    >
                      {review.customer_name}
                    </Link>

                    <p className="text-xs text-neutral-500">
                      {review.customer_email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-400">
                      Product
                    </p>

                    <Link
                      href={`/admin/products/${review.product_id}`}
                      className="mt-1 block text-sm font-medium text-neutral-900 hover:underline dark:text-white"
                    >
                      {review.product_name}
                    </Link>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}

                    <span className="text-xs text-neutral-500">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Review */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {review.title || "No title"}
                  </p>

                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {review.comment || "No comment"}
                  </p>
                </div>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {review.is_verified_purchase && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                      Verified Purchase
                    </span>
                  )}

                  {!review.is_verified_purchase && (
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                      Not Verified
                    </span>
                  )}

                  {review.is_reported && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                      Reported
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                  <span>Helpful: {review.helpful_count}</span>

                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="rounded-lg border border-neutral-200 p-6 text-center text-sm text-neutral-500 dark:border-neutral-800">
                No reviews found.
              </div>
            )}
          </div>

          {/* Desktop empty state */}
          {reviews.length === 0 && (
            <div className="hidden rounded-lg border border-neutral-200 p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 md:block">
              No reviews found.
            </div>
          )}
        </>
      )}
    </div>
  );
}