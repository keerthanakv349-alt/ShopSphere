"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/lib/protected-route";



// const NAV_ITEMS = [
//   { href: "/admin", label: "Dashboard" },
//   { href: "/admin/products", label: "Products" },
//   { href: "/admin/categories", label: "Categories" },
//   { href: "/admin/brands", label: "Brands" },
//   { href: "/admin/orders", label: "Orders" },
//   { href: "/admin/inventory", label: "Inventory"},
//   { href: "/admin/coupons", label: "Coupons" },
//   { href: "/admin/payments", label: "Payments" },
//   { href: "/admin/users", label: "Users" },
//   { href: "/admin/analytics", label: "Analytics" },
//   { href: "/admin/notifications", label: "Notifications" },

//   { href: "/admin/banners", label: "Banners" },
// ];


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
    ],
  },
  {
    title: "CUSTOMERS",
    items: [
      { href: "/admin/users", label: "Users" },
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[180px_1fr]">
        {/* <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav> */}
        <nav className="flex flex-row gap-4 overflow-x-auto md:flex-col md:gap-6">
  <div className="shrink-0">
    <Link
      href="/admin"
      className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
        pathname === "/admin"
          ? "bg-brand text-white"
          : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
      }`}
    >
      Dashboard
    </Link>
  </div>

  {NAV_SECTIONS.map((section) => (
    <div key={section.title} className="shrink-0">
      <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-neutral-400">
        {section.title}
      </p>

      <div className="flex gap-1 md:flex-col">
        {section.items.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-brand text-white"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  ))}
</nav>
        <div className="min-w-0">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
