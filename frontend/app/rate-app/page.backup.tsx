"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function RateAppPage() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating === 0) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-sm font-medium text-brand hover:underline"
        >
          ? Back to Profile
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Rate ShopSphere
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Tell us what you think about your ShopSphere experience.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div
              className="flex justify-center gap-2"
              role="radiogroup"
              aria-label="App rating"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRating(value);
                    setSubmitted(false);
                  }}
                  className={`text-4xl transition hover:scale-110 ${
                    value <= rating
                      ? "text-yellow-400"
                      : "text-neutral-300 dark:text-neutral-600"
                  }`}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  aria-pressed={value === rating}
                >
                  ?
                </button>
              ))}
            </div>

            <p className="mt-3 text-sm text-neutral-500">
              {rating === 0
                ? "Select a rating"
                : `${rating} out of 5 stars`}
            </p>

            {submitted && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Thank you for rating ShopSphere!
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/profile"
                className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={rating === 0}
                className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Rating
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
