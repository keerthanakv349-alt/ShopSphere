"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { createReview, fetchReviews, markReviewHelpful, reportReview } from "@/lib/engagement";
import { useAuthStore } from "@/lib/auth-store";

export function ProductReviews({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => !!s.tokens);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
  });

  const createMutation = useMutation({
    mutationFn: () => createReview(productId, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setComment("");
      setShowForm(false);
      toast.success("Review posted");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't post your review");
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: markReviewHelpful,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", productId] }),
  });

  const reportMutation = useMutation({
    mutationFn: reportReview,
    onSuccess: () => toast.success("Thanks — we'll take a look"),
  });

  if (isLoading || !summary) return null;

  return (
    <section className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Reviews</h2>
          {summary.review_count > 0 ? (
            <p className="text-sm text-neutral-500">
              ★ {summary.average_rating} · {summary.review_count} review
              {summary.review_count === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="text-sm text-neutral-500">No reviews yet — be the first.</p>
          )}
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowForm((v) => !v)} className="text-sm text-brand hover:underline">
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mb-6 flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
          <textarea
            required
            minLength={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product…"
            rows={3}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="self-start rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createMutation.isPending ? "Posting…" : "Post Review"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {summary.reviews.map((review) => (
          <div key={review.id} className="border-b border-neutral-100 pb-4 text-sm last:border-0 dark:border-neutral-900">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium">{"★".repeat(review.rating)}</span>
              {review.is_verified_purchase && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                  Verified Purchase
                </span>
              )}
            </div>
            {review.title && <p className="font-medium">{review.title}</p>}
            <p className="text-neutral-600 dark:text-neutral-400">{review.comment}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
              <span>{review.reviewer_name}</span>
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              <button onClick={() => helpfulMutation.mutate(review.id)} className="hover:text-brand">
                👍 Helpful ({review.helpful_count})
              </button>
              <button onClick={() => reportMutation.mutate(review.id)} className="hover:text-red-500">
                Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
