
//   return icons[label] ?? "•";
// }



"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  {
    title: "LOGISTICS",
    items: [
      { href: "/admin/delivery-partners", label: "Delivery Partners" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/audit-log", label: "Audit Log" },
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
  "Delivery Partners": "🚚",
  Settings: "⚙",
  "Audit Log": "≡",
};

function getNavIcon(label: string) {
  return NAV_ICONS[label] ?? "•";
}

// Shared between the desktop sidebar and the mobile drawer so the two
// can never drift out of sync — one nav definition, two places it's
// rendered. `onNavigate` closes the mobile drawer after a link is
// tapped; the desktop sidebar doesn't need it (it's always visible).
function AdminNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link
        href="/admin"
        onClick={onNavigate}
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
                    onClick={onNavigate}
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

      <div className="mt-8 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          <span className="mr-3">←</span>
          Back to Store
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Closing the drawer on every route change (not just on link click)
  // covers back/forward navigation too.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

        {/* Admin Header */}
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-md p-2 text-xl text-neutral-700 dark:text-neutral-300 md:hidden"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>

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
            </div>

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

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-white p-4 pt-20 dark:bg-neutral-950">
              <AdminNav pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </div>
        )}

        {/* Admin Body */}
        <div className="mx-auto flex max-w-[1600px]">

          {/* Desktop Sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 md:block">
            <AdminNav pathname={pathname} />
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




