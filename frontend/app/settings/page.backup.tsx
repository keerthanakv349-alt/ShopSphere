import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function SettingsPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-sm font-medium text-brand hover:underline"
        >
          ? Back to Profile
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your ShopSphere account settings.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/profile/edit"
            className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Edit Profile
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Update your name and phone number.
            </p>
          </Link>

          <Link
            href="/addresses"
            className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Delivery Addresses
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Add, edit, or manage your delivery addresses.
            </p>
          </Link>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Account Security
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Your account is protected using ShopSphere authentication.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
