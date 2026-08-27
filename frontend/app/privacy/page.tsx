import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-neutral-500">
            Your privacy is important to us.
          </p>

          <div className="mt-8 space-y-7 text-neutral-600 dark:text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p className="mt-2 leading-7">
                ShopSphere may collect information you provide when creating
                an account, managing your profile, placing orders, and using
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                2. How We Use Your Information
              </h2>
              <p className="mt-2 leading-7">
                Your information may be used to provide and improve our
                services, process orders, communicate with you, and provide
                customer support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                3. Payment Information
              </h2>
              <p className="mt-2 leading-7">
                Payment transactions are processed through the payment
                services integrated with ShopSphere. Sensitive payment
                credentials should not be shared through support channels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                4. Account Security
              </h2>
              <p className="mt-2 leading-7">
                We take reasonable measures to protect account information.
                You are also responsible for keeping your login credentials
                secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                5. Policy Updates
              </h2>
              <p className="mt-2 leading-7">
                This policy may be updated when necessary. Any updated version
                will be made available through ShopSphere.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

