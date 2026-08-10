/**
 * WHY THIS IS LOADED ON DEMAND, NOT IMPORTED NORMALLY:
 * Razorpay's Checkout widget only ships as a plain <script> tag from their
 * CDN (checkout.razorpay.com) — there's no npm package to `import`, and
 * even if there were, most visitors never reach the "pay now" moment in a
 * given session (browsing, cart, even placing an order don't need it).
 * Loading it lazily, only when the customer actually clicks "Pay Now",
 * keeps it off the initial bundle entirely.
 *
 * There's no official TypeScript types package for the widget either, so
 * `window.Razorpay` is typed loosely here (`any`) rather than pulling in
 * an unofficial third-party types package for one constructor call.
 */
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export {};
