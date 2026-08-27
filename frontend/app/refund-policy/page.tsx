import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <>
<main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-sm font-medium text-brand hover:underline"
        >
          ? Back to Profile
        </Link>

        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Refund Policy
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Information about refunds, returns, and eligible orders.
          </p>

          <div className="mt-8 space-y-7 text-neutral-600 dark:text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                1. Refund Eligibility
              </h2>
              <p className="mt-2 leading-7">
                Refunds are available for eligible orders according to the
                applicable return and refund conditions for the product.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                2. Requesting a Refund
              </h2>
              <p className="mt-2 leading-7">
                Customers should contact ShopSphere support with their order
                details when requesting a return or refund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                3. Refund Processing
              </h2>
              <p className="mt-2 leading-7">
                Once an eligible refund is approved, the refund will be
                processed through the applicable payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                4. Non-Eligible Orders
              </h2>
              <p className="mt-2 leading-7">
                Some products or orders may not qualify for a refund depending
                on their condition, return requirements, or other applicable
                restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                5. Need Help?
              </h2>
              <p className="mt-2 leading-7">
                If you have questions about a refund, please contact the
                ShopSphere Help Desk with your order information.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

