"use client";

import Link from "next/link";
import { FiArrowLeft, FiCreditCard } from "react-icons/fi";

import { ProtectedRoute } from "@/lib/protected-route";

function WalletContent() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            aria-label="Back to profile"
          >
            <FiArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">ShopSphere Wallet</h1>
            <p className="text-sm text-neutral-500">Store credit, refunds, and cashback in one place</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
            <FiCreditCard size={28} />
          </div>

          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Coming soon</h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
            We're building a wallet where refunds and store credit land instantly and can be used at checkout. It isn't live yet — nothing to see here for now.
          </p>

          <Link
            href="/profile"
            className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
