import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-sm font-medium text-brand hover:underline"
        >
          ? Back to Profile
        </Link>

        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About ShopSphere
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
            ShopSphere is an e-commerce platform designed to make online
            shopping simple, convenient, and enjoyable.
          </p>

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold">Our Mission</h2>
              <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">
                We aim to provide customers with a smooth shopping experience,
                reliable products, secure payments, and convenient order
                management.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">What We Offer</h2>
              <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">
                Browse products, manage your wishlist, place orders, track
                purchases, and manage your account from one place.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Shop With Confidence</h2>
              <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">
                ShopSphere is built with a focus on usability, security, and a
                responsive experience across desktop and mobile devices.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
