import { Suspense } from "react";
import { ProductsPageContent } from "./ProductsPageContent";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-neutral-500">
          Loading…
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}