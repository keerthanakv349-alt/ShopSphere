// "use client";

// import { usePathname } from "next/navigation";
// import { SiteHeader } from "./SiteHeader";

// export function AppHeader() {
//   const pathname = usePathname();

//   if (pathname.startsWith("/admin")) {
//     return null;
//   }

//   return <SiteHeader />;
// }



"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

export function AppHeader() {
  const pathname = usePathname();

  // Admin has its own completely separate header.
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Authentication pages should have a clean,
  // distraction-free login/signup experience.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return null;
  }

  return <SiteHeader />;
}