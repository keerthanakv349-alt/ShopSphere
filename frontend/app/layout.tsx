import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SiteHeader } from "@/components/SiteHeader";
import { ReactQueryProvider } from "./providers";
import "./globals.css";

// WHY METADATA HERE: Next.js App Router reads this exported object at
// build time to populate <title>/<meta> tags for SEO — no manual
// document.title juggling, and it composes: child routes can export
// their own `metadata` to override just the fields they need.
export const metadata: Metadata = {
  title: {
    default: "ShopSphere — Fashion & Lifestyle",
    template: "%s | ShopSphere",
  },
  description: "A production-style e-commerce platform built to learn real-world architecture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface font-body text-on-surface antialiased dark:bg-neutral-950 dark:text-neutral-50">
        <ReactQueryProvider>
          <SiteHeader />
          {children}
          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
