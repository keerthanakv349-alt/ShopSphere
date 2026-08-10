/**
 * WHY THIS FILE EXISTS:
 * ProductCard.tsx, app/cart/page.tsx, app/products/[slug]/page.tsx, and
 * app/admin/products/page.tsx each independently did:
 *
 *   src={`${API_ORIGIN}${product.primary_image_url}`}
 *
 * That is only correct when image_url is a RELATIVE backend path like
 * "/media/products/<id>/<file>.jpg" (what a real admin image upload
 * produces — see backend/app/core/images.py). But ProductImage.image_url
 * is a plain string column with no format constraint, and both the seed
 * script (backend/seed.py, picsum.photos placeholder images) and
 * next.config.js's own `{ protocol: "https", hostname: "**" }`
 * remotePatterns entry (written specifically to support a future S3/CDN
 * migration) anticipate ABSOLUTE image URLs too. Blindly prefixing an
 * already-absolute URL with API_ORIGIN produces a broken string like
 * "http://localhost:8000https://picsum.photos/seed/.../900/1125" — which
 * is the actual reason product images didn't render even after the
 * catalog had real seed data: the bug wasn't in the seed data, the
 * backend response, or next.config.js — it was in this string
 * concatenation, repeated in five places with no single source of truth.
 *
 * getMediaUrl() is that single source of truth: absolute URLs pass
 * through untouched, relative ones get the API origin prefixed, and null
 * stays null. Every image-rendering call site should go through this
 * instead of reimplementing the check.
 */
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // Already absolute (backend upload path is always relative, starting
  // with "/", so this only matches seed/CDN URLs that are already
  // fully-qualified) — return as-is, do not prefix.
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
