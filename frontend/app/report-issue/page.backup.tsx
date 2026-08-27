"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function ReportIssuePage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    setSubmitted(true);
    setSubject("");
    setMessage("");
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Report an Issue
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Tell us about a problem you experienced while using ShopSphere.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
        >
          <div className="mb-5">
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="What is the issue?"
              maxLength={120}
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              Describe the issue
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Please describe what happened..."
              rows={6}
              maxLength={1000}
              required
              className="w-full resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          {submitted && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Your issue has been recorded. Thank you for your feedback.
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/profile"
              className="rounded-lg border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
