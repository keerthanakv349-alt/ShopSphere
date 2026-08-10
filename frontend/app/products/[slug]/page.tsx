// // "use client";

// // import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// // import Image from "next/image";
// // import { notFound, useParams, useRouter } from "next/navigation";
// // import { useEffect, useMemo, useState } from "react";
// // import toast from "react-hot-toast";
// // import { addCartItem } from "@/lib/cart";
// // import { fetchProductBySlug } from "@/lib/catalog";
// // import { getMediaUrl } from "@/lib/media";
// // import { calculateDiscountedPrice, formatINR } from "@/lib/price";
// // import { useAuthStore } from "@/lib/auth-store";
// // import { recordRecentlyViewed } from "@/lib/recently-viewed";
// // import { ProductReviews } from "@/components/ProductReviews";
// // import { RelatedProducts, FrequentlyBoughtTogether } from "@/components/ProductRecommendations";
// // import { RecentlyViewed } from "@/components/RecentlyViewed";

// // export default function ProductDetailPage() {
// //   const params = useParams<{ slug: string }>();
// //   const router = useRouter();
// //   const queryClient = useQueryClient();
// //   const isAuthenticated = useAuthStore((s) => !!s.tokens);
// //   const { data: product, isLoading, isError } = useQuery({
// //     queryKey: ["product", params.slug],
// //     queryFn: () => fetchProductBySlug(params.slug),
// //   });

// //   // Distinct sizes/colors available across this product's variants — the
// //   // classic Myntra-style size/color picker reads off this, not off a
// //   // hardcoded list, since a Product's actual variants are what's real.
// //   const sizes = useMemo(
// //     () => [...new Set(product?.variants.map((v) => v.size).filter(Boolean))] as string[],
// //     [product]
// //   );
// //   const colors = useMemo(
// //     () => [...new Set(product?.variants.map((v) => v.color).filter(Boolean))] as string[],
// //     [product]
// //   );

// //   const [selectedSize, setSelectedSize] = useState<string | null>(null);
// //   const [selectedColor, setSelectedColor] = useState<string | null>(null);
// //   const [activeImage, setActiveImage] = useState(0);

// //   const selectedVariant = product?.variants.find(
// //     (v) => (sizes.length === 0 || v.size === selectedSize) && (colors.length === 0 || v.color === selectedColor)
// //   );

// //   if (isLoading) return <p className="p-16 text-center text-sm text-neutral-500">Loading…</p>;
// //   if (isError || !product) return notFound();

// //   const currentProduct = product; // narrowed non-null; closures below need a stable reference

// //   useEffect(() => {
// //     recordRecentlyViewed({
// //       id: currentProduct.id,
// //       name: currentProduct.name,
// //       slug: currentProduct.slug,
// //       base_price: currentProduct.base_price,
// //       discount_percentage: currentProduct.discount_percentage,
// //       status: currentProduct.status,
// //       is_featured: currentProduct.is_featured,
// //       is_trending: currentProduct.is_trending,
// //       category: currentProduct.category,
// //       brand: currentProduct.brand,
// //       primary_image_url: currentProduct.images[0]?.image_url ?? null,
// //     });
// //     // Runs once per product load — currentProduct is stable per render
// //     // pass for a given slug, and re-recording on every unrelated
// //     // re-render would be wasted work, not a correctness issue.
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [currentProduct.id]);

// //   const effectivePrice = calculateDiscountedPrice(
// //     selectedVariant?.price_override ?? product.base_price,
// //     product.discount_percentage
// //   );

// //   const addToCartMutation = useMutation({
// //     mutationFn: (variantId: string) => addCartItem(variantId, 1),
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["cart"] });
// //       toast.success(`Added ${currentProduct.name} to cart`);
// //     },
// //     onError: () => toast.error("Couldn't add this item to your cart. Please try again."),
// //   });

// //   function handleAddToCart() {
// //     if (!isAuthenticated) {
// //       router.push("/login");
// //       return;
// //     }
// //     if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
// //       toast.error("Please select a size and color");
// //       return;
// //     }
// //     if (!selectedVariant || selectedVariant.stock_quantity === 0) {
// //       toast.error("This variant is out of stock");
// //       return;
// //     }
// //     addToCartMutation.mutate(selectedVariant.id);
// //   }

// //   return (
// //     <main className="mx-auto max-w-5xl px-gutter py-lg">
// //       <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
// //         <div>
// //           <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-surface-container dark:bg-neutral-900">
// //             {product.images[activeImage] ? (
// //               <Image
// //                 src={getMediaUrl(product.images[activeImage].image_url)!}
// //                 alt={product.name}
// //                 fill
// //                 className="object-cover"
// //                 sizes="(max-width: 768px) 100vw, 50vw"
// //                 priority
// //               />
// //             ) : (
// //               <div className="flex h-full items-center justify-center text-body-md text-neutral-400">
// //                 No image available
// //               </div>
// //             )}
// //           </div>
// //           {product.images.length > 1 && (
// //             <div className="mt-3 flex gap-2">
// //               {product.images.map((img, i) => (
// //                 <button
// //                   key={img.id}
// //                   onClick={() => setActiveImage(i)}
// //                   className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
// //                     i === activeImage ? "border-brand" : "border-transparent"
// //                   }`}
// //                 >
// //                   <Image src={getMediaUrl(img.image_url)!} alt="" fill className="object-cover" />
// //                 </button>
// //               ))}
// //             </div>
// //           )}
// //         </div>

// //         <div>
// //           <p className="text-label-bold uppercase text-on-surface-variant">{product.brand.name}</p>
// //           <h1 className="font-heading text-headline-lg-mobile font-bold text-on-surface">{product.name}</h1>

// //           <div className="mt-3 flex items-center gap-2">
// //             <span className="text-headline-md font-bold text-brand">{formatINR(effectivePrice)}</span>
// //             {parseFloat(product.discount_percentage) > 0 && (
// //               <>
// //                 <span className="text-body-md text-outline line-through">
// //                   {formatINR(parseFloat(selectedVariant?.price_override ?? product.base_price))}
// //                 </span>
// //                 <span className="rounded bg-success/10 px-1.5 py-0.5 text-label-bold text-success">
// //                   -{parseFloat(product.discount_percentage)}%
// //                 </span>
// //               </>
// //             )}
// //           </div>
// //           <p className="mt-1 text-label-sm text-on-surface-variant">Inclusive of {product.gst_percentage}% GST</p>

// //           {colors.length > 0 && (
// //             <div className="mt-6">
// //               <p className="mb-2 text-label-bold uppercase text-on-surface-variant">Color</p>
// //               <div className="flex flex-wrap gap-2">
// //                 {colors.map((color) => (
// //                   <button
// //                     key={color}
// //                     onClick={() => setSelectedColor(color)}
// //                     className={`rounded-lg border px-3 py-1.5 text-body-md ${
// //                       selectedColor === color
// //                         ? "border-brand text-brand"
// //                         : "border-outline-variant dark:border-neutral-700"
// //                     }`}
// //                   >
// //                     {color}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {sizes.length > 0 && (
// //             <div className="mt-4">
// //               <div className="mb-2 flex items-center justify-between">
// //                 <p className="text-label-bold uppercase text-on-surface-variant">Select Size</p>
// //               </div>
// //               <div className="flex flex-wrap gap-2">
// //                 {sizes.map((size) => (
// //                   <button
// //                     key={size}
// //                     onClick={() => setSelectedSize(size)}
// //                     className={`rounded-lg border px-3 py-1.5 text-body-md ${
// //                       selectedSize === size
// //                         ? "border-brand font-medium text-brand"
// //                         : "border-outline-variant dark:border-neutral-700"
// //                     }`}
// //                   >
// //                     {size}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {selectedVariant && (
// //             <p className="mt-3 text-label-sm text-on-surface-variant">
// //               {selectedVariant.stock_quantity > 0
// //                 ? `${selectedVariant.stock_quantity} in stock`
// //                 : "Out of stock"}
// //             </p>
// //           )}

// //           <button
// //             onClick={handleAddToCart}
// //             disabled={addToCartMutation.isPending}
// //             className="mt-6 w-full rounded-lg bg-brand px-4 py-3 text-body-md font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-60"
// //           >
// //             {addToCartMutation.isPending ? "Adding…" : "Add to Bag"}
// //           </button>

// //           <div className="mt-8 border-t border-outline-variant pt-4 text-body-md text-on-surface-variant dark:border-neutral-800">
// //             <p className="mb-1 font-medium text-on-surface">Product details</p>
// //             <p>{product.description || "No description available."}</p>
// //           </div>
// //         </div>
// //       </div>

// //       <FrequentlyBoughtTogether slug={currentProduct.slug} />
// //       <ProductReviews productId={currentProduct.id} />
// //       <RelatedProducts slug={currentProduct.slug} />
// //       <RecentlyViewed excludeId={currentProduct.id} />
// //     </main>
// //   );
// // }



// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import Image from "next/image";
// import { notFound, useParams, useRouter } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { addCartItem } from "@/lib/cart";
// import { fetchProductBySlug } from "@/lib/catalog";
// import { getMediaUrl } from "@/lib/media";
// import { calculateDiscountedPrice, formatINR } from "@/lib/price";
// import { useAuthStore } from "@/lib/auth-store";
// import { recordRecentlyViewed } from "@/lib/recently-viewed";
// import { ProductReviews } from "@/components/ProductReviews";
// import { RelatedProducts, FrequentlyBoughtTogether } from "@/components/ProductRecommendations";
// import { RecentlyViewed } from "@/components/RecentlyViewed";

// export default function ProductDetailPage() {
//   const params = useParams<{ slug: string }>();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const isAuthenticated = useAuthStore((s) => !!s.tokens);
//   const { data: product, isLoading, isError } = useQuery({
//     queryKey: ["product", params.slug],
//     queryFn: () => fetchProductBySlug(params.slug),
//   });

//   // Distinct sizes/colors available across this product's variants — the
//   // classic Myntra-style size/color picker reads off this, not off a
//   // hardcoded list, since a Product's actual variants are what's real.
//   const sizes = useMemo(
//     () => [...new Set(product?.variants.map((v) => v.size).filter(Boolean))] as string[],
//     [product]
//   );
//   const colors = useMemo(
//     () => [...new Set(product?.variants.map((v) => v.color).filter(Boolean))] as string[],
//     [product]
//   );

//   const [selectedSize, setSelectedSize] = useState<string | null>(null);
//   const [selectedColor, setSelectedColor] = useState<string | null>(null);
//   const [activeImage, setActiveImage] = useState(0);

//   const selectedVariant = product?.variants.find(
//     (v) => (sizes.length === 0 || v.size === selectedSize) && (colors.length === 0 || v.color === selectedColor)
//   );

//   // WHY THIS HOOK MOVED ABOVE THE isLoading/isError EARLY RETURNS BELOW:
//   // React requires every hook to run in the exact same order on every
//   // render of a given component instance — that's how it matches each
//   // useState/useEffect call back to its own slot of internal state
//   // across renders, since hooks aren't identified by name, only by call
//   // order. This useEffect used to sit AFTER the two early `return`
//   // statements below. On the render where isLoading is true, the
//   // component returned before ever reaching this useEffect — so React
//   // recorded one fewer hook call for that render than for the next one
//   // (once data arrives, isLoading flips to false and execution proceeds
//   // past the early return into this useEffect for the first time).
//   // That mismatch is exactly what "Rendered more hooks than during the
//   // previous render" means, and it's not a one-off — it fires on every
//   // single product page load, right as the query resolves. Hooks must
//   // be unconditional; the *work inside* the hook is what gets guarded
//   // with a plain `if (!product) return` instead.
//   useEffect(() => {
//     if (!product) return;
//     recordRecentlyViewed({
//       id: product.id,
//       name: product.name,
//       slug: product.slug,
//       base_price: product.base_price,
//       discount_percentage: product.discount_percentage,
//       status: product.status,
//       is_featured: product.is_featured,
//       is_trending: product.is_trending,
//       category: product.category,
//       brand: product.brand,
//       primary_image_url: product.images[0]?.image_url ?? null,
//     });
//     // Runs once per product load — re-recording on every unrelated
//     // re-render would be wasted work, not a correctness issue.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [product?.id]);

//   if (isLoading) return <p className="p-16 text-center text-sm text-neutral-500">Loading…</p>;
//   if (isError || !product) return notFound();

//   const currentProduct = product; // narrowed non-null; closures below need a stable reference

//   const effectivePrice = calculateDiscountedPrice(
//     selectedVariant?.price_override ?? product.base_price,
//     product.discount_percentage
//   );

//   const addToCartMutation = useMutation({
//     mutationFn: (variantId: string) => addCartItem(variantId, 1),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//       toast.success(`Added ${currentProduct.name} to cart`);
//     },
//     onError: () => toast.error("Couldn't add this item to your cart. Please try again."),
//   });

//   function handleAddToCart() {
//     if (!isAuthenticated) {
//       router.push("/login");
//       return;
//     }
//     if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
//       toast.error("Please select a size and color");
//       return;
//     }
//     if (!selectedVariant || selectedVariant.stock_quantity === 0) {
//       toast.error("This variant is out of stock");
//       return;
//     }
//     addToCartMutation.mutate(selectedVariant.id);
//   }

//   return (
//     <main className="mx-auto max-w-5xl px-gutter py-lg">
//       <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
//         <div>
//           <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-surface-container dark:bg-neutral-900">
//             {product.images[activeImage] ? (
//               <Image
//                 src={getMediaUrl(product.images[activeImage].image_url)!}
//                 alt={product.name}
//                 fill
//                 className="object-cover"
//                 sizes="(max-width: 768px) 100vw, 50vw"
//                 priority
//               />
//             ) : (
//               <div className="flex h-full items-center justify-center text-body-md text-neutral-400">
//                 No image available
//               </div>
//             )}
//           </div>
//           {product.images.length > 1 && (
//             <div className="mt-3 flex gap-2">
//               {product.images.map((img, i) => (
//                 <button
//                   key={img.id}
//                   onClick={() => setActiveImage(i)}
//                   className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
//                     i === activeImage ? "border-brand" : "border-transparent"
//                   }`}
//                 >
//                   <Image src={getMediaUrl(img.image_url)!} alt="" fill className="object-cover" />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         <div>
//           <p className="text-label-bold uppercase text-on-surface-variant">{product.brand.name}</p>
//           <h1 className="font-heading text-headline-lg-mobile font-bold text-on-surface">{product.name}</h1>

//           <div className="mt-3 flex items-center gap-2">
//             <span className="text-headline-md font-bold text-brand">{formatINR(effectivePrice)}</span>
//             {parseFloat(product.discount_percentage) > 0 && (
//               <>
//                 <span className="text-body-md text-outline line-through">
//                   {formatINR(parseFloat(selectedVariant?.price_override ?? product.base_price))}
//                 </span>
//                 <span className="rounded bg-success/10 px-1.5 py-0.5 text-label-bold text-success">
//                   -{parseFloat(product.discount_percentage)}%
//                 </span>
//               </>
//             )}
//           </div>
//           <p className="mt-1 text-label-sm text-on-surface-variant">Inclusive of {product.gst_percentage}% GST</p>

//           {colors.length > 0 && (
//             <div className="mt-6">
//               <p className="mb-2 text-label-bold uppercase text-on-surface-variant">Color</p>
//               <div className="flex flex-wrap gap-2">
//                 {colors.map((color) => (
//                   <button
//                     key={color}
//                     onClick={() => setSelectedColor(color)}
//                     className={`rounded-lg border px-3 py-1.5 text-body-md ${
//                       selectedColor === color
//                         ? "border-brand text-brand"
//                         : "border-outline-variant dark:border-neutral-700"
//                     }`}
//                   >
//                     {color}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {sizes.length > 0 && (
//             <div className="mt-4">
//               <div className="mb-2 flex items-center justify-between">
//                 <p className="text-label-bold uppercase text-on-surface-variant">Select Size</p>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {sizes.map((size) => (
//                   <button
//                     key={size}
//                     onClick={() => setSelectedSize(size)}
//                     className={`rounded-lg border px-3 py-1.5 text-body-md ${
//                       selectedSize === size
//                         ? "border-brand font-medium text-brand"
//                         : "border-outline-variant dark:border-neutral-700"
//                     }`}
//                   >
//                     {size}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {selectedVariant && (
//             <p className="mt-3 text-label-sm text-on-surface-variant">
//               {selectedVariant.stock_quantity > 0
//                 ? `${selectedVariant.stock_quantity} in stock`
//                 : "Out of stock"}
//             </p>
//           )}

//           <button
//             onClick={handleAddToCart}
//             disabled={addToCartMutation.isPending}
//             className="mt-6 w-full rounded-lg bg-brand px-4 py-3 text-body-md font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-60"
//           >
//             {addToCartMutation.isPending ? "Adding…" : "Add to Bag"}
//           </button>

//           <div className="mt-8 border-t border-outline-variant pt-4 text-body-md text-on-surface-variant dark:border-neutral-800">
//             <p className="mb-1 font-medium text-on-surface">Product details</p>
//             <p>{product.description || "No description available."}</p>
//           </div>
//         </div>
//       </div>

//       <FrequentlyBoughtTogether slug={currentProduct.slug} />
//       <ProductReviews productId={currentProduct.id} />
//       <RelatedProducts slug={currentProduct.slug} />
//       <RecentlyViewed excludeId={currentProduct.id} />
//     </main>
//   );
// }



"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { addCartItem } from "@/lib/cart";
import { fetchProductBySlug } from "@/lib/catalog";
import { getMediaUrl } from "@/lib/media";
import { calculateDiscountedPrice, formatINR } from "@/lib/price";
import { useAuthStore } from "@/lib/auth-store";
import { recordRecentlyViewed } from "@/lib/recently-viewed";
import { ProductReviews } from "@/components/ProductReviews";
import { RelatedProducts, FrequentlyBoughtTogether } from "@/components/ProductRecommendations";
import { RecentlyViewed } from "@/components/RecentlyViewed";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => !!s.tokens);
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => fetchProductBySlug(params.slug),
  });

  // Distinct sizes/colors available across this product's variants — the
  // classic Myntra-style size/color picker reads off this, not off a
  // hardcoded list, since a Product's actual variants are what's real.
  const sizes = useMemo(
    () => [...new Set(product?.variants.map((v) => v.size).filter(Boolean))] as string[],
    [product]
  );
  const colors = useMemo(
    () => [...new Set(product?.variants.map((v) => v.color).filter(Boolean))] as string[],
    [product]
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = product?.variants.find(
    (v) => (sizes.length === 0 || v.size === selectedSize) && (colors.length === 0 || v.color === selectedColor)
  );

  // WHY THIS HOOK MOVED ABOVE THE isLoading/isError EARLY RETURNS BELOW:
  // React requires every hook to run in the exact same order on every
  // render of a given component instance — that's how it matches each
  // useState/useEffect call back to its own slot of internal state
  // across renders, since hooks aren't identified by name, only by call
  // order. This useEffect used to sit AFTER the two early `return`
  // statements below. On the render where isLoading is true, the
  // component returned before ever reaching this useEffect — so React
  // recorded one fewer hook call for that render than for the next one
  // (once data arrives, isLoading flips to false and execution proceeds
  // past the early return into this useEffect for the first time).
  // That mismatch is exactly what "Rendered more hooks than during the
  // previous render" means, and it's not a one-off — it fires on every
  // single product page load, right as the query resolves. Hooks must
  // be unconditional; the *work inside* the hook is what gets guarded
  // with a plain `if (!product) return` instead.
  useEffect(() => {
    if (!product) return;
    recordRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      base_price: product.base_price,
      discount_percentage: product.discount_percentage,
      status: product.status,
      is_featured: product.is_featured,
      is_trending: product.is_trending,
      category: product.category,
      brand: product.brand,
      primary_image_url: product.images[0]?.image_url ?? null,
    });
    // Runs once per product load — re-recording on every unrelated
    // re-render would be wasted work, not a correctness issue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // WHY THIS HOOK ALSO MOVED ABOVE THE EARLY RETURNS BELOW:
  // Same reasoning as the useEffect above — useMutation is a hook too,
  // and it used to sit AFTER the isLoading/isError early returns. That
  // was the actual, still-present cause of "Rendered more hooks than
  // during the previous render" continuing to fire after the first fix:
  // moving the useEffect wasn't enough on its own, because this hook was
  // the very next one still in the wrong place. onSuccess/onError below
  // reference `product` (not `currentProduct`, which doesn't exist yet
  // at this point) with a fallback, since TypeScript correctly sees
  // `product` as possibly undefined here — but in practice this
  // callback only ever runs after `mutate()` is called from
  // handleAddToCart, which is itself only reachable from JSX rendered
  // after the early returns below, so `product` is always defined by
  // the time onSuccess/onError actually fire.
  const addToCartMutation = useMutation({
    mutationFn: (variantId: string) => addCartItem(variantId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Added ${product?.name ?? "item"} to cart`);
    },
    onError: () => toast.error("Couldn't add this item to your cart. Please try again."),
  });

  if (isLoading) return <p className="p-16 text-center text-sm text-neutral-500">Loading…</p>;
  if (isError || !product) return notFound();

  const currentProduct = product; // narrowed non-null; closures below need a stable reference

  const effectivePrice = calculateDiscountedPrice(
    selectedVariant?.price_override ?? product.base_price,
    product.discount_percentage
  );

  function handleAddToCart() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
      toast.error("Please select a size and color");
      return;
    }
    if (!selectedVariant || selectedVariant.stock_quantity === 0) {
      toast.error("This variant is out of stock");
      return;
    }
    addToCartMutation.mutate(selectedVariant.id);
  }

  return (
    <main className="mx-auto max-w-5xl px-gutter py-lg">
      <div className="grid grid-cols-1 gap-xl md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-surface-container dark:bg-neutral-900">
            {product.images[activeImage] ? (
              <Image
                src={getMediaUrl(product.images[activeImage].image_url)!}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-body-md text-neutral-400">
                No image available
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-md border-2 ${
                    i === activeImage ? "border-brand" : "border-transparent"
                  }`}
                >
                  <Image src={getMediaUrl(img.image_url)!} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-label-bold uppercase text-on-surface-variant">{product.brand.name}</p>
          <h1 className="font-heading text-headline-lg-mobile font-bold text-on-surface">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-headline-md font-bold text-brand">{formatINR(effectivePrice)}</span>
            {parseFloat(product.discount_percentage) > 0 && (
              <>
                <span className="text-body-md text-outline line-through">
                  {formatINR(parseFloat(selectedVariant?.price_override ?? product.base_price))}
                </span>
                <span className="rounded bg-success/10 px-1.5 py-0.5 text-label-bold text-success">
                  -{parseFloat(product.discount_percentage)}%
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-label-sm text-on-surface-variant">Inclusive of {product.gst_percentage}% GST</p>

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-label-bold uppercase text-on-surface-variant">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-3 py-1.5 text-body-md ${
                      selectedColor === color
                        ? "border-brand text-brand"
                        : "border-outline-variant dark:border-neutral-700"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-label-bold uppercase text-on-surface-variant">Select Size</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-3 py-1.5 text-body-md ${
                      selectedSize === size
                        ? "border-brand font-medium text-brand"
                        : "border-outline-variant dark:border-neutral-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedVariant && (
            <p className="mt-3 text-label-sm text-on-surface-variant">
              {selectedVariant.stock_quantity > 0
                ? `${selectedVariant.stock_quantity} in stock`
                : "Out of stock"}
            </p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="mt-6 w-full rounded-lg bg-brand px-4 py-3 text-body-md font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {addToCartMutation.isPending ? "Adding…" : "Add to Bag"}
          </button>

          <div className="mt-8 border-t border-outline-variant pt-4 text-body-md text-on-surface-variant dark:border-neutral-800">
            <p className="mb-1 font-medium text-on-surface">Product details</p>
            <p>{product.description || "No description available."}</p>
          </div>
        </div>
      </div>

      <FrequentlyBoughtTogether slug={currentProduct.slug} />
      <ProductReviews productId={currentProduct.id} />
      <RelatedProducts slug={currentProduct.slug} />
      <RecentlyViewed excludeId={currentProduct.id} />
    </main>
  );
}
