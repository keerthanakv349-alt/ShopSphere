"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchCart } from "@/lib/cart";
import { useAuthStore } from "@/lib/auth-store";
import { NotificationBell } from "./NotificationBell";

export function SiteHeader() {
  const isAuthenticated = useAuthStore((s) => !!s.tokens);
  const user = useAuthStore((s) => s.user);

  // Only fetch the cart when logged in — an anonymous visitor has no
  // server-side cart to query (see lib/cart.ts / backend cart.py, which
  // scopes everything to the authenticated user).
  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: isAuthenticated,
  });

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-3">
        <Link href="/" className="font-heading text-headline-md font-bold tracking-tight text-brand">
          ShopSphere
        </Link>
        <nav className="flex items-center gap-5 text-body-md">
          <Link href="/products" className="hover:text-brand">
            Products
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/orders" className="hover:text-brand">
                Orders
              </Link>
              <Link href="/cart" className="relative hover:text-brand">
                Cart
                {itemCount > 0 && (
                  <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-label-sm text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link href="/profile" className="hover:text-brand">
                {user?.full_name.split(" ")[0] ?? "Profile"}
              </Link>
              {(user?.role === "admin" || user?.role === "super_admin") && (
                <Link href="/admin" className="rounded-md border border-outline-variant px-2 py-1 text-label-sm dark:border-neutral-700">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition hover:bg-brand-dark"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
