import Link from "next/link";

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Open your Orders page and select the order you want to track to view its current status.",
  },
  {
    question: "How can I cancel an order?",
    answer:
      "Open the relevant order and check whether cancellation is available for its current status.",
  },
  {
    question: "How can I request a refund?",
    answer:
      "Check the Refund Policy and contact ShopSphere support with your order details if you need assistance.",
  },
  {
    question: "How can I update my profile?",
    answer:
      "Go to Profile ? Settings ? Edit Profile to update your name and phone number.",
  },
  {
    question: "How can I manage my addresses?",
    answer:
      "Open the Addresses section from your profile to add or manage delivery addresses.",
  },
];

export default function HelpPage() {
  return (
    <>
<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center text-sm font-medium text-brand hover:underline"
        >
          ? Back to Profile
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            Help Desk
          </h1>
          <p className="mt-2 text-neutral-500">
            Find answers to common ShopSphere questions.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <section
              key={faq.question}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {faq.question}
              </h2>

              <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Need more help?
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            If your question is not answered above, please keep your order
            details ready when contacting ShopSphere support.
          </p>

          <Link
            href="/report-issue"
            className="mt-4 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Report an Issue
          </Link>
        </div>
      </main>
    </>
  );
}

