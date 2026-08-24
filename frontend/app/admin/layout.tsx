// // // "use client";

// // // import Link from "next/link";
// // // import { usePathname } from "next/navigation";
// // // import { ProtectedRoute } from "@/lib/protected-route";



// // // // const NAV_ITEMS = [
// // // //   { href: "/admin", label: "Dashboard" },
// // // //   { href: "/admin/products", label: "Products" },
// // // //   { href: "/admin/categories", label: "Categories" },
// // // //   { href: "/admin/brands", label: "Brands" },
// // // //   { href: "/admin/orders", label: "Orders" },
// // // //   { href: "/admin/inventory", label: "Inventory"},
// // // //   { href: "/admin/coupons", label: "Coupons" },
// // // //   { href: "/admin/payments", label: "Payments" },
// // // //   { href: "/admin/users", label: "Users" },
// // // //   { href: "/admin/analytics", label: "Analytics" },
// // // //   { href: "/admin/notifications", label: "Notifications" },

// // // //   { href: "/admin/banners", label: "Banners" },
// // // // ];


// // // const NAV_SECTIONS = [
// // //   {
// // //     title: "CATALOG",
// // //     items: [
// // //       { href: "/admin/products", label: "Products" },
// // //       { href: "/admin/categories", label: "Categories" },
// // //       { href: "/admin/brands", label: "Brands" },
// // //       { href: "/admin/inventory", label: "Inventory" },
// // //     ],
// // //   },
// // //   {
// // //     title: "SALES",
// // //     items: [
// // //       { href: "/admin/orders", label: "Orders" },
// // //       { href: "/admin/payments", label: "Payments" },
// // //       { href: "/admin/coupons", label: "Coupons" },
// // //       { href: "/admin/reviews", label: "Reviews" },
// // //     ],
// // //   },
// // //   {
// // //     title: "CUSTOMERS",
// // //     items: [
// // //       { href: "/admin/users", label: "Users" },
// // //       { href: "/admin/notifications", label: "Notifications" },
// // //     ],
// // //   },
// // //   {
// // //     title: "MARKETING",
// // //     items: [
// // //       { href: "/admin/banners", label: "Banners" },
// // //     ],
// // //   },
// // //   {
// // //     title: "ANALYTICS",
// // //     items: [
// // //       { href: "/admin/analytics", label: "Sales Analytics" },
// // //     ],
// // //   },
// // // ];

// // // export default function AdminLayout({ children }: { children: React.ReactNode }) {
// // //   const pathname = usePathname();

// // //   return (
// // //     <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
// // //       <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[180px_1fr]">
// // //         {/* <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
// // //           {NAV_ITEMS.map((item) => {
// // //             const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
// // //             return (
// // //               <Link
// // //                 key={item.href}
// // //                 href={item.href}
// // //                 className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
// // //                   isActive
// // //                     ? "bg-brand text-white"
// // //                     : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
// // //                 }`}
// // //               >
// // //                 {item.label}
// // //               </Link>
// // //             );
// // //           })}
// // //         </nav> */}
// // //         <nav className="flex flex-row gap-4 overflow-x-auto md:flex-col md:gap-6">
// // //   <div className="shrink-0">
// // //     <Link
// // //       href="/admin"
// // //       className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
// // //         pathname === "/admin"
// // //           ? "bg-brand text-white"
// // //           : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
// // //       }`}
// // //     >
// // //       Dashboard
// // //     </Link>
// // //   </div>

// // //   {NAV_SECTIONS.map((section) => (
// // //     <div key={section.title} className="shrink-0">
// // //       <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-neutral-400">
// // //         {section.title}
// // //       </p>

// // //       <div className="flex gap-1 md:flex-col">
// // //         {section.items.map((item) => {
// // //           const isActive = pathname.startsWith(item.href);

// // //           return (
// // //             <Link
// // //               key={item.href}
// // //               href={item.href}
// // //               className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
// // //                 isActive
// // //                   ? "bg-brand text-white"
// // //                   : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
// // //               }`}
// // //             >
// // //               {item.label}
// // //             </Link>
// // //           );
// // //         })}
// // //       </div>
// // //     </div>
// // //   ))}
// // // </nav>
// // //         <div className="min-w-0">{children}</div>
// // //       </div>
// // //     </ProtectedRoute>
// // //   );
// // // }


// // "use client";

// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import { ProtectedRoute } from "@/lib/protected-route";
// // import { NotificationBell } from "@/components/NotificationBell";
// // import { useAuthStore } from "@/lib/auth-store";

// // const NAV_SECTIONS = [
// //   {
// //     title: "CATALOG",
// //     items: [
// //       { href: "/admin/products", label: "Products" },
// //       { href: "/admin/categories", label: "Categories" },
// //       { href: "/admin/brands", label: "Brands" },
// //       { href: "/admin/inventory", label: "Inventory" },
// //     ],
// //   },
// //   {
// //     title: "SALES",
// //     items: [
// //       { href: "/admin/orders", label: "Orders" },
// //       { href: "/admin/payments", label: "Payments" },
// //       { href: "/admin/coupons", label: "Coupons" },
// //       { href: "/admin/reviews", label: "Reviews" },
// //     ],
// //   },
// //   {
// //     title: "CUSTOMERS",
// //     items: [
// //       { href: "/admin/users", label: "Customers" },
// //       { href: "/admin/notifications", label: "Notifications" },
// //     ],
// //   },
// //   {
// //     title: "MARKETING",
// //     items: [
// //       { href: "/admin/banners", label: "Banners" },
// //     ],
// //   },
// //   {
// //     title: "ANALYTICS",
// //     items: [
// //       { href: "/admin/analytics", label: "Sales Analytics" },
// //     ],
// //   },
// // ];

// // export default function AdminLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   const pathname = usePathname();
// //   const user = useAuthStore((state) => state.user);

// //   return (
// //     <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
// //       <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
// //         {/* Admin Header */}
// //         <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
// //           <div className="flex h-16 items-center justify-between px-4 sm:px-6">
// //             <Link
// //               href="/admin"
// //               className="flex items-center gap-2"
// //             >
// //               <span className="text-xl font-bold tracking-tight text-brand">
// //                 ShopSphere
// //               </span>

// //               <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
// //                 ADMIN
// //               </span>
// //             </Link>

// //             <div className="flex items-center gap-4">
// //               <NotificationBell />

// //               <Link
// //                 href="/profile"
// //                 className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-neutral-100 dark:hover:bg-neutral-900"
// //               >
// //                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
// //                   {user?.full_name?.charAt(0).toUpperCase() ?? "A"}
// //                 </div>

// //                 <div className="hidden text-left sm:block">
// //                   <p className="text-sm font-medium text-neutral-900 dark:text-white">
// //                     {user?.full_name ?? "Admin"}
// //                   </p>
// //                   <p className="text-xs text-neutral-500">
// //                     {user?.role === "super_admin"
// //                       ? "Super Admin"
// //                       : "Administrator"}
// //                   </p>
// //                 </div>
// //               </Link>
// //             </div>
// //           </div>
// //         </header>

// //         <div className="mx-auto flex max-w-[1600px]">
// //           {/* Admin Sidebar */}
// //           <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:block">
// //             {/* Dashboard */}
// //             <Link
// //               href="/admin"
// //               className={`mb-6 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
// //                 pathname === "/admin"
// //                   ? "bg-brand text-white"
// //                   : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
// //               }`}
// //             >
// //               <span className="mr-3">▦</span>
// //               Dashboard
// //             </Link>

// //             <nav className="space-y-6">
// //               {NAV_SECTIONS.map((section) => (
// //                 <div key={section.title}>
// //                   <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-neutral-400">
// //                     {section.title}
// //                   </p>

// //                   <div className="space-y-1">
// //                     {section.items.map((item) => {
// //                       const isActive = pathname.startsWith(item.href);

// //                       return (
// //                         <Link
// //                           key={item.href}
// //                           href={item.href}
// //                           className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
// //                             isActive
// //                               ? "bg-brand text-white"
// //                               : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
// //                           }`}
// //                         >
// //                           <span className="mr-3 text-base">
// //                             {getNavIcon(item.label)}
// //                           </span>

// //                           {item.label}
// //                         </Link>
// //                       );
// //                     })}
// //                   </div>
// //                 </div>
// //               ))}
// //             </nav>

// //             {/* Customer Site */}
// //             <div className="mt-8 border-t border-neutral-200 pt-4 dark:border-neutral-800">
// //               <Link
// //                 href="/"
// //                 className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
// //               >
// //                 <span className="mr-3">←</span>
// //                 View Customer Site
// //               </Link>
// //             </div>
// //           </aside>

// //           {/* Mobile navigation */}
// //           <div className="border-b border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
// //             <div className="flex gap-2 overflow-x-auto">
// //               <Link
// //                 href="/admin"
// //                 className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
// //                   pathname === "/admin"
// //                     ? "bg-brand text-white"
// //                     : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
// //                 }`}
// //               >
// //                 Dashboard
// //               </Link>

// //               {NAV_SECTIONS.flatMap((section) => section.items).map(
// //                 (item) => {
// //                   const isActive = pathname.startsWith(item.href);

// //                   return (
// //                     <Link
// //                       key={item.href}
// //                       href={item.href}
// //                       className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
// //                         isActive
// //                           ? "bg-brand text-white"
// //                           : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
// //                       }`}
// //                     >
// //                       {item.label}
// //                     </Link>
// //                   );
// //                 }
// //               )}
// //             </div>
// //           </div>

// //           {/* Main Admin Content */}
// //           <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
// //             {children}
// //           </main>
// //         </div>
// //       </div>
// //     </ProtectedRoute>
// //   );
// // }

// // function getNavIcon(label: string) {
// //   const icons: Record<string, string> = {
// //     Products: "▣",
// //     Categories: "▤",
// //     Brands: "◆",
// //     Inventory: "▥",
// //     Orders: "▤",
// //     Payments: "₹",
// //     Coupons: "%",
// //     Reviews: "★",
// //     Customers: "♙",
// //     Notifications: "●",
// //     Banners: "▰",
// //     "Sales Analytics": "▥",
// //   };

// //   return icons[label] ?? "•";
// // }



// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { ProtectedRoute } from "@/lib/protected-route";
// import { NotificationBell } from "@/components/NotificationBell";
// import { useAuthStore } from "@/lib/auth-store";

// const NAV_SECTIONS = [
//   {
//     title: "CATALOG",
//     items: [
//       { href: "/admin/products", label: "Products" },
//       { href: "/admin/categories", label: "Categories" },
//       { href: "/admin/brands", label: "Brands" },
//       { href: "/admin/inventory", label: "Inventory" },
//     ],
//   },
//   {
//     title: "SALES",
//     items: [
//       { href: "/admin/orders", label: "Orders" },
//       { href: "/admin/payments", label: "Payments" },
//       { href: "/admin/coupons", label: "Coupons" },
//       { href: "/admin/reviews", label: "Reviews" },
//     ],
//   },
//   {
//     title: "CUSTOMERS",
//     items: [
//       { href: "/admin/users", label: "Customers" },
//       { href: "/admin/notifications", label: "Notifications" },
//     ],
//   },
//   {
//     title: "MARKETING",
//     items: [
//       { href: "/admin/banners", label: "Banners" },
//     ],
//   },
//   {
//     title: "ANALYTICS",
//     items: [
//       { href: "/admin/analytics", label: "Sales Analytics" },
//     ],
//   },
// ];

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const user = useAuthStore((state) => state.user);

//   return (
//     <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
//       <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

//         {/* =========================
//             ADMIN HEADER
//         ========================== */}
//         <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
//           <div className="flex h-16 items-center justify-between px-4 sm:px-6">

//             {/* Admin Logo */}
//             <Link
//               href="/admin"
//               className="flex items-center gap-2"
//             >
//               <span className="text-xl font-bold tracking-tight text-brand">
//                 ShopSphere
//               </span>

//               <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
//                 ADMIN
//               </span>
//             </Link>

//             {/* Admin Actions */}
//             <div className="flex items-center gap-4">

//               {/* Admin Notifications */}
//               <NotificationBell />

//               {/* Admin identity - NOT a customer profile link */}
//               <div className="flex items-center gap-2">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
//                   {user?.full_name?.charAt(0).toUpperCase() ?? "A"}
//                 </div>

//                 <div className="hidden text-left sm:block">
//                   <p className="text-sm font-medium text-neutral-900 dark:text-white">
//                     {user?.full_name ?? "Admin"}
//                   </p>

//                   <p className="text-xs text-neutral-500">
//                     {user?.role === "super_admin"
//                       ? "Super Admin"
//                       : "Administrator"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* =========================
//             ADMIN BODY
//         ========================== */}
//         <div className="mx-auto flex max-w-[1600px]">

//           {/* =========================
//               DESKTOP SIDEBAR
//           ========================== */}
//           <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:block">

//             {/* Dashboard */}
//             <Link
//               href="/admin"
//               className={`mb-6 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
//                 pathname === "/admin"
//                   ? "bg-brand text-white"
//                   : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
//               }`}
//             >
//               <span className="mr-3">▦</span>
//               Dashboard
//             </Link>

//             {/* Navigation Sections */}
//             <nav className="space-y-6">
//               {NAV_SECTIONS.map((section) => (
//                 <div key={section.title}>

//                   <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-neutral-400">
//                     {section.title}
//                   </p>

//                   <div className="space-y-1">
//                     {section.items.map((item) => {
//                       const isActive = pathname.startsWith(item.href);

//                       return (
//                         <Link
//                           key={item.href}
//                           href={item.href}
//                           className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
//                             isActive
//                               ? "bg-brand text-white"
//                               : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
//                           }`}
//                         >
//                           <span className="mr-3 text-base">
//                             {getNavIcon(item.label)}
//                           </span>

//                           {item.label}
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </nav>

//             {/* =========================
//                 CUSTOMER STOREFRONT LINK
//             ========================== */}
//             <div className="mt-8 border-t border-neutral-200 pt-4 dark:border-neutral-800">
//               <Link
//                 href="/"
//                 className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
//               >
//                 <span className="mr-3">←</span>
//                 View Customer Site
//               </Link>
//             </div>
//           </aside>

//           {/* =========================
//               MOBILE ADMIN NAVIGATION
//           ========================== */}
//           <div className="border-b border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
//             <div className="flex gap-2 overflow-x-auto">

//               <Link
//                 href="/admin"
//                 className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
//                   pathname === "/admin"
//                     ? "bg-brand text-white"
//                     : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
//                 }`}
//               >
//                 Dashboard
//               </Link>

//               {NAV_SECTIONS.flatMap((section) => section.items).map(
//                 (item) => {
//                   const isActive = pathname.startsWith(item.href);

//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
//                         isActive
//                           ? "bg-brand text-white"
//                           : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
//                       }`}
//                     >
//                       {item.label}
//                     </Link>
//                   );
//                 }
//               )}
//             </div>
//           </div>

//           {/* =========================
//               ADMIN PAGE CONTENT
//           ========================== */}
//           <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
//             {children}
//           </main>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

// function getNavIcon(label: string) {
//   const icons: Record<string, string> = {
//     Products: "▣",
//     Categories: "▤",
//     Brands: "◆",
//     Inventory: "▥",
//     Orders: "▤",
//     Payments: "₹",
//     Coupons: "%",
//     Reviews: "★",
//     Customers: "♙",
//     Notifications: "●",
//     Banners: "▰",
//     "Sales Analytics": "▥",
//   };

//   return icons[label] ?? "•";
// }



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuthStore } from "@/lib/auth-store";

const NAV_SECTIONS = [
  {
    title: "CATALOG",
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/brands", label: "Brands" },
      { href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    title: "SALES",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/payments", label: "Payments" },
      { href: "/admin/coupons", label: "Coupons" },
      { href: "/admin/reviews", label: "Reviews" },
    ],
  },
  {
    title: "CUSTOMERS",
    items: [
      { href: "/admin/users", label: "Customers" },
      { href: "/admin/notifications", label: "Notifications" },
    ],
  },
  {
    title: "MARKETING",
    items: [
      { href: "/admin/banners", label: "Banners" },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { href: "/admin/analytics", label: "Sales Analytics" },
    ],
  },
];

const NAV_ICONS: Record<string, string> = {
  Dashboard: "▦",
  Products: "◈",
  Categories: "◫",
  Brands: "◆",
  Inventory: "▤",
  Orders: "▣",
  Payments: "◉",
  Coupons: "◇",
  Reviews: "★",
  Customers: "♙",
  Notifications: "●",
  Banners: "▰",
  "Sales Analytics": "▥",
};

function getNavIcon(label: string) {
  return NAV_ICONS[label] ?? "•";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

        {/* Admin Header */}
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">

            {/* Logo */}
            <Link
              href="/admin"
              className="flex items-center gap-2"
            >
              <span className="text-xl font-bold tracking-tight text-brand">
                ShopSphere
              </span>

              <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                ADMIN
              </span>
            </Link>

            {/* Admin Identity */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {user?.full_name?.charAt(0).toUpperCase() ?? "A"}
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user?.full_name ?? "Admin"}
                </p>

                <p className="text-xs text-neutral-500">
                  {user?.role === "super_admin"
                    ? "Super Admin"
                    : "Administrator"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Body */}
        <div className="mx-auto flex max-w-[1600px]">

          {/* Desktop Sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:block">

            {/* Dashboard */}
            <Link
              href="/admin"
              className={`mb-6 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === "/admin"
                  ? "bg-brand text-white"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              }`}
            >
              <span className="mr-3 text-base">
                {getNavIcon("Dashboard")}
              </span>

              Dashboard
            </Link>

            {/* Navigation */}
            <nav className="space-y-6">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>

                  <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-neutral-400">
                    {section.title}
                  </p>

                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                            isActive
                              ? "bg-brand text-white"
                              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                          }`}
                        >
                          <span className="mr-3 text-base">
                            {getNavIcon(item.label)}
                          </span>

                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Back to Store */}
            <div className="mt-8 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <Link
                href="/"
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
              >
                <span className="mr-3">←</span>
                Back to Store
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}