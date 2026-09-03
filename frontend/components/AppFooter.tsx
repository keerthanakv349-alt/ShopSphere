"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

export function AppFooter() {
  const pathname = usePathname();

  // Admin has its own layout/chrome — the storefront footer (category
  // links, popular searches, etc.) doesn't belong there. Mirrors how
  // AppHeader already excludes itself on the same routes.
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <SiteFooter />;
}
