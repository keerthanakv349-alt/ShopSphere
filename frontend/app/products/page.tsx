import { Suspense } from "react";
import { ProductsPageContent } from "./ProductsPageContent";

// WHY THE SUSPENSE WRAPPER: useSearchParams() opts a component out of
// static rendering — Next.js requires it to sit under a Suspense boundary
// so the rest of the page shell can still be prerendered while the
// search-params-dependent content streams in. Without this, `next build`
// either errors or silently forces the whole route to render client-only.
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Loading…</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
