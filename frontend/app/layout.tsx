// import type { Metadata } from "next";
// import { Toaster } from "react-hot-toast";
// import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
// import { ReactQueryProvider } from "./providers";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: {
//     default: "ShopSphere â€” Fashion & Lifestyle",
//     template: "%s | ShopSphere",
//   },
//   description:
//     "A production-style e-commerce platform built to learn real-world architecture.",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className="min-h-screen bg-surface font-body text-on-surface antialiased dark:bg-neutral-950 dark:text-neutral-50">
//         <ReactQueryProvider>
//           <AppHeader />

//           {children}          <SiteFooter />

//           <Toaster position="top-center" />
//         </ReactQueryProvider>
//       </body>
//     </html>
//   );
// }




import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AppHeader } from "@/components/AppHeader";
import { ReactQueryProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ShopSphere â€“ Fashion & Lifestyle",
    template: "%s | ShopSphere",
  },
  description:
    "A production-style e-commerce platform built to learn real-world architecture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface font-body text-on-surface antialiased dark:bg-neutral-950 dark:text-neutral-50">
        <ReactQueryProvider>
          <AppHeader />

          {children}          <SiteFooter />

          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}


