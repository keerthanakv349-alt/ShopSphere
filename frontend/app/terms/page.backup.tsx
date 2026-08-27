import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Please read these terms before using ShopSphere.
          </p>

          <div className="mt-8 space-y-7 text-neutral-600 dark:text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                1. Using ShopSphere
              </h2>
              <p className="mt-2 leading-7">
                By using ShopSphere, you agree to use the platform responsibly
                and provide accurate information when creating and managing
                your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                2. Products and Orders
              </h2>
              <p className="mt-2 leading-7">
                Product information, availability, prices, and offers may
                change from time to time. Orders are subject to product
                availability and successful payment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                3. Payments
              </h2>
              <p className="mt-2 leading-7">
                Payments must be completed through the payment methods
                provided by ShopSphere. Customers should not attempt to
                interfere with or misuse the payment system.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                4. Account Responsibility
              </h2>
              <p className="mt-2 leading-7">
                You are responsible for maintaining the security of your
                account information and for activity performed through your
                account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                5. Changes to These Terms
              </h2>
              <p className="mt-2 leading-7">
                ShopSphere may update these terms when necessary. Updated
                terms will be made available through the application.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
