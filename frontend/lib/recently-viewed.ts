/**
 * WHY THIS IS localStorage, NOT A BACKEND ENDPOINT:
 * "Recently viewed" is inherently per-device, ephemeral browsing history
 * — it doesn't need to survive a device switch or be queryable by admins,
 * and a customer would likely be surprised if their view history WAS
 * synced/stored server-side without being told. Every major e-commerce
 * site implements exactly this feature client-side for the same reasons.
 * Contrast with the cart (Phase 3), which genuinely needs to be
 * server-side because "add to cart on phone, check out on laptop" is a
 * real, expected use case — recently-viewed has no equivalent need.
 */
import type { Product } from "@/types/catalog";

const STORAGE_KEY = "shopsphere:recently-viewed";
const MAX_ITEMS = 8;

export function recordRecentlyViewed(product: Product): void {
  if (typeof window === "undefined") return;
  try {
    const existing: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const withoutCurrent = existing.filter((p) => p.id !== product.id);
    const updated = [product, ...withoutCurrent].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage can throw (private browsing, storage full) — this
    // feature is a nice-to-have and never worth crashing the page over.
  }
}

export function getRecentlyViewed(excludeId?: string): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const existing: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return existing.filter((p) => p.id !== excludeId);
  } catch {
    return [];
  }
}
