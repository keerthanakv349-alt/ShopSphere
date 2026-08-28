// // "use client";

// // import { useQuery } from "@tanstack/react-query";
// // import Link from "next/link";
// // import { fetchCart } from "@/lib/cart";
// // import { useAuthStore } from "@/lib/auth-store";
// // import { NotificationBell } from "./NotificationBell";

// // export function SiteHeader() {
// //   const isAuthenticated = useAuthStore((s) => !!s.tokens);
// //   const user = useAuthStore((s) => s.user);

// //   // Only fetch the cart when logged in — an anonymous visitor has no
// //   // server-side cart to query (see lib/cart.ts / backend cart.py, which
// //   // scopes everything to the authenticated user).
// //   const { data: cart } = useQuery({
// //     queryKey: ["cart"],
// //     queryFn: fetchCart,
// //     enabled: isAuthenticated,
// //   });

// //   const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

// //   return (
// //     <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
// //       <div className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-3">
// //         <Link href="/" className="font-heading text-headline-md font-bold tracking-tight text-brand">
// //           ShopSphere
// //         </Link>
// //         <nav className="flex items-center gap-5 text-body-md">
// //           <Link href="/products" className="hover:text-brand">
// //             Products
// //           </Link>
// //           {isAuthenticated ? (
// //             <>
// //               <Link href="/orders" className="hover:text-brand">
// //                 Orders
// //               </Link>

// //               <Link href="/wishlist" className="hover:text-brand">
// //   Wishlist
// // </Link>
// //               <Link href="/cart" className="relative hover:text-brand">
// //                 Cart
// //                 {itemCount > 0 && (
// //                   <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-label-sm text-white">
// //                     {itemCount}
// //                   </span>
// //                 )}
// //               </Link>
// //               <NotificationBell />
// //               <Link href="/profile" className="hover:text-brand">
// //                 {user?.full_name.split(" ")[0] ?? "Profile"}
// //               </Link>
// //               {(user?.role === "admin" || user?.role === "super_admin") && (
// //                 <Link href="/admin" className="rounded-md border border-outline-variant px-2 py-1 text-label-sm dark:border-neutral-700">
// //                   Admin
// //                 </Link>
// //               )}
// //             </>
// //           ) : (
// //             <>
// //               <Link href="/login" className="hover:text-brand">
// //                 Log in
// //               </Link>
// //               <Link
// //                 href="/signup"
// //                 className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition hover:bg-brand-dark"
// //               >
// //                 Sign up
// //               </Link>
// //             </>
// //           )}
// //         </nav>
// //       </div>
// //     </header>
// //   );
// // }




// "use client";

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import Link from "next/link";
// import Image from "next/image";
// import {
//   FiSearch,
//   FiUser,
//   FiHeart,
//   FiShoppingBag,
// } from "react-icons/fi";

// import { fetchCart } from "@/lib/cart";
// import { useAuthStore } from "@/lib/auth-store";
// import { NotificationBell } from "./NotificationBell";

// export function SiteHeader() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);

//   const isAuthenticated = useAuthStore((s) => !!s.tokens);
//   const user = useAuthStore((s) => s.user);

//   const { data: cart } = useQuery({
//     queryKey: ["cart"],
//     queryFn: fetchCart,
//     enabled: isAuthenticated,
//   });

//   const itemCount =
//     cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

//   const closeMobileMenu = () => {
//     setMobileMenuOpen(false);
//   };


//   const categories = {
//     MEN: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets", "Shoes", "Watches"],
//     WOMEN: ["Dresses", "Tops", "Sarees", "Kurtas", "Jeans", "Handbags", "Footwear"],
//     KIDS: ["Boys", "Girls", "T-Shirts", "Dresses", "Shoes", "Toys"],
//     HOME: ["Home Decor", "Bedsheets", "Curtains", "Cushions", "Kitchen", "Furniture"],
//     BEAUTY: ["Makeup", "Skincare", "Haircare", "Fragrances", "Bath & Body"],
//     GENZ: ["Trending", "Streetwear", "Oversized", "Sneakers", "Accessories"],
//     STUDIO: ["Fashion Stories", "Trending Looks", "Style Guide", "New Arrivals"],
//   };

//   return (
//     <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
//       <div className="mx-auto flex max-w-container-max items-center justify-between px-4 py-3 sm:px-gutter">
        
//         {/* Logo */}
//         {/* <Link
//           href="/"
//           className="font-heading text-headline-md font-bold tracking-tight text-brand"
//           onClick={closeMobileMenu}
//         >
//           ShopSphere
//         </Link> */}

//         {/* Logo */}
// {/* Logo */}
// <Link
//   href="/"
//   className="flex items-center"
//   onClick={closeMobileMenu}
// >
//   <Image
//     src="/images/logo.png"
//     alt="ShopSphere"
//     width={42}
//     height={42}
//     priority
//     className="h-10 w-10 object-contain"
//   />

// </Link>


//         {/* Desktop Navigation */}
//         {/* <nav className="hidden items-center gap-5 text-body-md md:flex">
//           <Link href="/products" className="hover:text-brand">
//             Products
//           </Link>

//           {isAuthenticated ? (
//             <>
//               <Link href="/orders" className="hover:text-brand">
//                 Orders
//               </Link>

//               <Link href="/wishlist" className="hover:text-brand">
//                 Wishlist
//               </Link>

//               <Link
//                 href="/cart"
//                 className="relative hover:text-brand"
//               >
//                 Cart

//                 {itemCount > 0 && (
//                   <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-label-sm text-white">
//                     {itemCount}
//                   </span>
//                 )}
//               </Link>

//               <NotificationBell />

//               <Link
//                 href="/profile"
//                 className="hover:text-brand"
//               >
//                 {user?.full_name?.split(" ")[0] ?? "Profile"}
//               </Link>

//               {(user?.role === "admin" ||
//                 user?.role === "super_admin") && (
//                 <Link
//                   href="/admin"
//                   className="rounded-md border border-outline-variant px-2 py-1 text-label-sm dark:border-neutral-700"
//                 >
//                   Admin
//                 </Link>
//               )}
//             </>
//           ) : (
//             <>
//               <Link href="/login" className="hover:text-brand">
//                 Log in
//               </Link>

//               <Link
//                 href="/signup"
//                 className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition hover:bg-brand-dark"
//               >
//                 Sign up
//               </Link>
//             </>
//           )}
//         </nav> */}


//         {/* Desktop Navigation */}
//         <nav className="hidden flex-1 items-center justify-end gap-6 md:flex">
//           <div
//             className="flex items-center gap-6 text-sm font-semibold"
//             onMouseLeave={() => setActiveCategory(null)}
//           >
//             {Object.keys(categories).map((category) => (
//               <div
//                 key={category}
//                 className="relative py-5"
//                 onMouseEnter={() => setActiveCategory(category)}
//               >
//                 <Link
//                   href="/products"
//                   className={`hover:text-brand ${
//                     activeCategory === category ? "text-brand" : ""
//                   }`}
//                 >
//                   {category}
//                 </Link>
//               </div>
//             ))}
//           </div>

//           <div className="relative w-72 lg:w-80">
//             <FiSearch
//               size={18}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
//             />
//             <input
//               type="search"
//               placeholder="Search for products, brands and more"
//               className="w-full rounded-md bg-neutral-100 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand/20"
//             />
//           </div>

//           <div className="flex items-center gap-5">
//             <Link
//               href="/profile"
//               className="flex flex-col items-center gap-1 text-xs hover:text-brand"
//             >
//               <FiUser size={20} />
//               <span>Profile</span>
//             </Link>

//             <Link
//               href="/wishlist"
//               className="flex flex-col items-center gap-1 text-xs hover:text-brand"
//             >
//               <FiHeart size={20} />
//               <span>Wishlist</span>
//             </Link>

//             <Link
//               href="/cart"
//               className="relative flex flex-col items-center gap-1 text-xs hover:text-brand"
//             >
//               <FiShoppingBag size={20} />
//               <span>Bag</span>
//               {itemCount > 0 && (
//                 <span className="absolute -right-2 -top-1 rounded-full bg-brand px-1.5 text-[10px] text-white">
//                   {itemCount}
//                 </span>
//               )}
//             </Link>
//           </div>
//         </nav>

//         {/* Category Mega Menu */}
//         {activeCategory && (
//           <div
//             className="absolute left-0 right-0 top-full z-50 border-t border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
//             onMouseEnter={() => setActiveCategory(activeCategory)}
//             onMouseLeave={() => setActiveCategory(null)}
//           >
//             <div className="mx-auto max-w-container-max px-8 py-8">
//               <h3 className="mb-5 text-sm font-bold text-brand">
//                 {activeCategory}
//               </h3>
//               <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
//                 {categories[
//                   activeCategory as keyof typeof categories
//                 ].map((item) => (
//                   <Link
//                     key={item}
//                     href="/products"
//                     className="text-sm text-neutral-600 transition hover:text-brand dark:text-neutral-300"
//                     onClick={() => setActiveCategory(null)}
//                   >
//                     {item}
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Mobile Menu Button */}
//         <button
//           type="button"
//           className="rounded-md p-2 text-xl md:hidden"
//           aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
//           aria-expanded={mobileMenuOpen}
//           onClick={() => setMobileMenuOpen((open) => !open)}
//         >
//           {mobileMenuOpen ? "✕" : "☰"}
//         </button>
//       </div>

//       {/* Mobile Navigation */}
//       {mobileMenuOpen && (
//         <div className="border-t border-outline-variant bg-surface px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
//           <nav className="flex flex-col gap-1 text-body-md">

//             <Link
//               href="/products"
//               className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
//               onClick={closeMobileMenu}
//             >
//               Products
//             </Link>

//             {isAuthenticated ? (
//               <>
//                 <Link
//                   href="/orders"
//                   className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
//                   onClick={closeMobileMenu}
//                 >
//                   Orders
//                 </Link>

//                 <Link
//                   href="/wishlist"
//                   className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
//                   onClick={closeMobileMenu}
//                 >
//                   Wishlist
//                 </Link>

//                 <Link
//                   href="/cart"
//                   className="flex items-center justify-between rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
//                   onClick={closeMobileMenu}
//                 >
//                   <span>Cart</span>

//                   {itemCount > 0 && (
//                     <span className="rounded-full bg-brand px-2 py-0.5 text-label-sm text-white">
//                       {itemCount}
//                     </span>
//                   )}
//                 </Link>

//                 <div className="rounded-md px-3 py-3">
//                   <NotificationBell />
//                 </div>

//                 <Link
//                   href="/profile"
//                   className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
//                   onClick={closeMobileMenu}
//                 >
//                   {user?.full_name?.split(" ")[0] ?? "Profile"}
//                 </Link>

//                 {(user?.role === "admin" ||
//                   user?.role === "super_admin") && (
//                   <Link
//                     href="/admin"
//                     className="rounded-md border border-outline-variant px-3 py-3 dark:border-neutral-700"
//                     onClick={closeMobileMenu}
//                   >
//                     Admin
//                   </Link>
//                 )}
//               </>
//             ) : (
//               <>
//                 <Link
//                   href="/login"
//                   className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
//                   onClick={closeMobileMenu}
//                 >
//                   Log in
//                 </Link>

//                 <Link
//                   href="/signup"
//                   className="mt-2 rounded-lg bg-brand px-3 py-3 text-center font-medium text-white transition hover:bg-brand-dark"
//                   onClick={closeMobileMenu}
//                 >
//                   Sign up
//                 </Link>
//               </>
//             )}
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }





// "use client";

// import { useQuery } from "@tanstack/react-query";
// import Link from "next/link";
// import { fetchCart } from "@/lib/cart";
// import { useAuthStore } from "@/lib/auth-store";
// import { NotificationBell } from "./NotificationBell";

// export function SiteHeader() {
//   const isAuthenticated = useAuthStore((s) => !!s.tokens);
//   const user = useAuthStore((s) => s.user);

//   // Only fetch the cart when logged in — an anonymous visitor has no
//   // server-side cart to query (see lib/cart.ts / backend cart.py, which
//   // scopes everything to the authenticated user).
//   const { data: cart } = useQuery({
//     queryKey: ["cart"],
//     queryFn: fetchCart,
//     enabled: isAuthenticated,
//   });

//   const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

//   return (
//     <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
//       <div className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-3">
//         <Link href="/" className="font-heading text-headline-md font-bold tracking-tight text-brand">
//           ShopSphere
//         </Link>
//         <nav className="flex items-center gap-5 text-body-md">
//           <Link href="/products" className="hover:text-brand">
//             Products
//           </Link>
//           {isAuthenticated ? (
//             <>
//               <Link href="/orders" className="hover:text-brand">
//                 Orders
//               </Link>

//               <Link href="/wishlist" className="hover:text-brand">
//   Wishlist
// </Link>
//               <Link href="/cart" className="relative hover:text-brand">
//                 Cart
//                 {itemCount > 0 && (
//                   <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-label-sm text-white">
//                     {itemCount}
//                   </span>
//                 )}
//               </Link>
//               <NotificationBell />
//               <Link href="/profile" className="hover:text-brand">
//                 {user?.full_name.split(" ")[0] ?? "Profile"}
//               </Link>
//               {(user?.role === "admin" || user?.role === "super_admin") && (
//                 <Link href="/admin" className="rounded-md border border-outline-variant px-2 py-1 text-label-sm dark:border-neutral-700">
//                   Admin
//                 </Link>
//               )}
//             </>
//           ) : (
//             <>
//               <Link href="/login" className="hover:text-brand">
//                 Log in
//               </Link>
//               <Link
//                 href="/signup"
//                 className="rounded-lg bg-brand px-3 py-1.5 font-medium text-white transition hover:bg-brand-dark"
//               >
//                 Sign up
//               </Link>
//             </>
//           )}
//         </nav>
//       </div>
//     </header>
//   );
// }




"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";

import { fetchCart } from "@/lib/cart";
import { useAuthStore } from "@/lib/auth-store";
import { NotificationBell } from "./NotificationBell";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((s) => !!s.tokens);
  const user = useAuthStore((s) => s.user);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: isAuthenticated,
  });

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  const categories = {
    MEN: {
      TOPWEAR: [
        "T-Shirts",
        "Shirts",
        "Casual Shirts",
        "Formal Shirts",
        "Sweatshirts",
        "Sweaters",
        "Jackets",
        "Blazers & Coats",
      ],
      BOTTOMWEAR: [
        "Jeans",
        "Casual Trousers",
        "Formal Trousers",
        "Shorts",
        "Track Pants & Joggers",
      ],
      FOOTWEAR: [
        "Casual Shoes",
        "Sports Shoes",
        "Formal Shoes",
        "Sneakers",
        "Sandals & Floaters",
        "Flip Flops",
      ],
      "SPORTS & ACTIVE WEAR": [
        "Sports Shoes",
        "Sports Sandals",
        "Active T-Shirts",
        "Track Pants & Shorts",
        "Tracksuits",
        "Sports Accessories",
      ],
      "FASHION ACCESSORIES": [
        "Wallets",
        "Belts",
        "Sunglasses",
        "Watches",
        "Caps & Hats",
        "Bags & Backpacks",
      ],
    },

    WOMEN: {
      TOPWEAR: [
        "T-Shirts",
        "Tops",
        "Shirts",
        "Kurtas",
        "Tunics",
        "Dresses",
        "Sweaters",
        "Jackets",
      ],
      BOTTOMWEAR: [
        "Jeans",
        "Trousers",
        "Shorts",
        "Skirts",
        "Leggings",
      ],
      "INDIAN & FUSION WEAR": [
        "Kurtas & Suits",
        "Sarees",
        "Ethnic Dresses",
        "Lehenga Choli",
        "Palazzos",
      ],
      FOOTWEAR: [
        "Casual Shoes",
        "Sports Shoes",
        "Flats",
        "Heels",
        "Sandals",
        "Boots",
      ],
      "FASHION ACCESSORIES": [
        "Handbags",
        "Jewellery",
        "Watches",
        "Sunglasses",
        "Belts",
      ],
    },

    KIDS: {
      BOYS: [
        "T-Shirts",
        "Shirts",
        "Jeans",
        "Trousers",
        "Shorts",
        "Ethnic Wear",
      ],
      GIRLS: [
        "Dresses",
        "Tops",
        "T-Shirts",
        "Jeans",
        "Skirts",
        "Ethnic Wear",
      ],
      FOOTWEAR: [
        "Casual Shoes",
        "Sports Shoes",
        "Sandals",
        "School Shoes",
      ],
      "TOYS & GAMES": [
        "Action Figures",
        "Educational Toys",
        "Games",
        "Soft Toys",
      ],
      "ACCESSORIES": [
        "Bags",
        "Watches",
        "Sunglasses",
        "Hair Accessories",
      ],
    },

    HOME: {
      "HOME DECOR": [
        "Wall Decor",
        "Clocks",
        "Mirrors",
        "Photo Frames",
        "Candles",
      ],
      BEDDING: [
        "Bedsheets",
        "Bed Covers",
        "Blankets",
        "Pillows",
      ],
      "BATH & FLOORING": [
        "Bath Towels",
        "Bath Mats",
        "Floor Mats",
        "Rugs",
      ],
      KITCHEN: [
        "Cookware",
        "Kitchen Storage",
        "Dinnerware",
        "Kitchen Tools",
      ],
      FURNITURE: [
        "Chairs",
        "Tables",
        "Storage",
        "Home Office",
      ],
    },

    BEAUTY: {
      MAKEUP: [
        "Lipstick",
        "Lip Gloss",
        "Foundation",
        "Kajal",
        "Mascara",
      ],
      SKINCARE: [
        "Face Wash",
        "Moisturizers",
        "Serums",
        "Sunscreen",
      ],
      HAIRCARE: [
        "Shampoo",
        "Conditioner",
        "Hair Oil",
        "Hair Styling",
      ],
      FRAGRANCES: [
        "Perfumes",
        "Body Mists",
        "Deodorants",
      ],
      "BATH & BODY": [
        "Body Wash",
        "Body Lotion",
        "Hand & Foot Care",
      ],
    },

    GENZ: {
      TRENDING: [
        "Trending Now",
        "New Arrivals",
        "Best Sellers",
        "Viral Styles",
      ],
      STREETWEAR: [
        "Oversized",
        "Graphic Tees",
        "Cargo Pants",
        "Streetwear",
      ],
      FOOTWEAR: [
        "Sneakers",
        "Chunky Shoes",
        "Casual Shoes",
      ],
      ACCESSORIES: [
        "Caps",
        "Sunglasses",
        "Jewellery",
        "Bags",
      ],
      "STYLE PICKS": [
        "Party Wear",
        "College Wear",
        "Weekend Looks",
      ],
    },

    STUDIO: {
      "FASHION STORIES": [
        "Style Guide",
        "Fashion Trends",
        "Celebrity Style",
      ],
      "TRENDING LOOKS": [
        "Street Style",
        "Festive Looks",
        "Party Looks",
      ],
      "STYLE GUIDE": [
        "What to Wear",
        "How to Style",
        "Outfit Ideas",
      ],
      "NEW ARRIVALS": [
        "Latest Fashion",
        "New Collections",
        "Editor's Picks",
      ],
    },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-4 py-3 sm:px-gutter">
        
        {/* Logo */}
        {/* <Link
          href="/"
          className="font-heading text-headline-md font-bold tracking-tight text-brand"
          onClick={closeMobileMenu}
        >
          ShopSphere
        </Link> */}

        {/* Logo */}
{/* Logo */}
<Link
  href="/"
  className="flex items-center"
  onClick={closeMobileMenu}
>
  <Image
    src="/images/logo.png"
    alt="ShopSphere"
    width={42}
    height={42}
    priority
    className="h-10 w-10 object-contain"
  />

   <span className="flex h-7 w-7 items-center justify-between font-bold text-2xl  text-pink-500">
      ShopSphere
    </span>

</Link>


        {/* Desktop Navigation */}
        {/* <nav className="hidden items-center gap-5 text-body-md md:flex">
          <Link href="/products" className="hover:text-brand">
            Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/orders" className="hover:text-brand">
                Orders
              </Link>

              <Link href="/wishlist" className="hover:text-brand">
                Wishlist
              </Link>

              <Link
                href="/cart"
                className="relative hover:text-brand"
              >
                Cart

                {itemCount > 0 && (
                  <span className="absolute -right-3 -top-2 rounded-full bg-brand px-1.5 text-label-sm text-white">
                    {itemCount}
                  </span>
                )}
              </Link>

              <NotificationBell />

              <Link
                href="/profile"
                className="hover:text-brand"
              >
                {user?.full_name?.split(" ")[0] ?? "Profile"}
              </Link>

              {(user?.role === "admin" ||
                user?.role === "super_admin") && (
                <Link
                  href="/admin"
                  className="rounded-md border border-outline-variant px-2 py-1 text-label-sm dark:border-neutral-700"
                >
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
        </nav> */}


        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-end gap-6 md:flex">
          <div
            className="flex items-center gap-6 text-sm font-semibold"
            // onMouseLeave={() => setActiveCategory(null)}
          >
            {Object.keys(categories).map((category) => (
              <div
                key={category}
                className="relative py-5"
                onMouseEnter={() => setActiveCategory(category)}
              >
                <Link
                  href="/products"
                  className={`hover:text-brand ${
                    activeCategory === category ? "text-brand" : ""
                  }`}
                >
                  {category}
                </Link>
              </div>
            ))}
          </div>

          <div className="relative w-72 lg:w-80">
            <FiSearch
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="search"
              placeholder="Search for products, brands and more"
              className="w-full rounded-md bg-neutral-100 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 text-xs hover:text-brand"
            >
              <FiUser size={20} />
              <span>Profile</span>
            </Link>

            <Link
              href="/wishlist"
              className="flex flex-col items-center gap-1 text-xs hover:text-brand"
            >
              <FiHeart size={20} />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex flex-col items-center gap-1 text-xs hover:text-brand"
            >
              <FiShoppingBag size={20} />
              <span>Bag</span>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-1 rounded-full bg-brand px-1.5 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Category Mega Menu */}
        {activeCategory && (
          <div
            className="absolute left-0 right-0 top-full z-50 border-t border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
            onMouseEnter={() => setActiveCategory(activeCategory)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="mx-auto max-w-container-max px-8 py-8">
              <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(
                  categories[activeCategory as keyof typeof categories]
                ).map(([section, items]) => (
                  <div key={section}>
                    <h3 className="mb-3 text-xs font-bold text-brand">
                      {section}
                    </h3>

                    <div className="flex flex-col gap-2">
                      {items.map((item) => {
  const categoryMap: Record<string, string> = {
    "MEN|T-Shirts": "Men - T-Shirts",
    "MEN|Shirts": "Men - Shirts",
    "MEN|Casual Shirts": "Men - Shirts",
    "MEN|Formal Shirts": "Men - Shirts",
    "MEN|Sweatshirts": "Men - Jackets",
    "MEN|Sweaters": "Men - Jackets",
    "MEN|Jackets": "Men - Jackets",
    "MEN|Blazers & Coats": "Men - Jackets",
    "MEN|Jeans": "Men - Jeans",
    "MEN|Casual Trousers": "Men - Trousers",
    "MEN|Formal Trousers": "Men - Trousers",
    "MEN|Shorts": "Men - Sports & Activewear",
    "MEN|Track Pants & Joggers": "Men - Sports & Activewear",
    "MEN|Casual Shoes": "Men - Footwear",
    "MEN|Sports Shoes": "Men - Footwear",
    "MEN|Formal Shoes": "Men - Footwear",
    "MEN|Sneakers": "Men - Footwear",
    "MEN|Sandals & Floaters": "Men - Footwear",
    "MEN|Flip Flops": "Men - Footwear",
    "MEN|Sports Sandals": "Men - Sports & Activewear",
    "MEN|Active T-Shirts": "Men - Sports & Activewear",
    "MEN|Track Pants & Shorts": "Men - Sports & Activewear",
    "MEN|Tracksuits": "Men - Sports & Activewear",
    "MEN|Sports Accessories": "Men - Sports & Activewear",
    "MEN|Wallets": "Men - Accessories",
    "MEN|Belts": "Men - Accessories",
    "MEN|Sunglasses": "Men - Accessories",
    "MEN|Watches": "Men - Accessories",
    "MEN|Caps & Hats": "Men - Accessories",
    "MEN|Bags & Backpacks": "Men - Accessories",

    "WOMEN|T-Shirts": "Women - Tops",
    "WOMEN|Tops": "Women - Tops",
    "WOMEN|Shirts": "Women - Tops",
    "WOMEN|Kurtas": "Women - Kurtas",
    "WOMEN|Tunics": "Women - Tops",
    "WOMEN|Dresses": "Women - Dresses",
    "WOMEN|Sweaters": "Women - Tops",
    "WOMEN|Jackets": "Women - Tops",
    "WOMEN|Jeans": "Women - Jeans",
    "WOMEN|Trousers": "Women - Trousers",
    "WOMEN|Shorts": "Women - Trousers",
    "WOMEN|Skirts": "Women - Trousers",
    "WOMEN|Leggings": "Women - Trousers",
    "WOMEN|Kurtas & Suits": "Women - Kurtas",
    "WOMEN|Sarees": "Women - Sarees",
    "WOMEN|Ethnic Dresses": "Women - Dresses",
    "WOMEN|Lehenga Choli": "Women - Kurtas",
    "WOMEN|Palazzos": "Women - Trousers",
    "WOMEN|Casual Shoes": "Women - Footwear",
    "WOMEN|Sports Shoes": "Women - Footwear",
    "WOMEN|Flats": "Women - Footwear",
    "WOMEN|Heels": "Women - Footwear",
    "WOMEN|Sandals": "Women - Footwear",
    "WOMEN|Boots": "Women - Footwear",
    "WOMEN|Handbags": "Women - Handbags",
    "WOMEN|Jewellery": "Women - Accessories",
    "WOMEN|Watches": "Women - Accessories",
    "WOMEN|Sunglasses": "Women - Accessories",
    "WOMEN|Belts": "Women - Accessories",

    "KIDS|T-Shirts": "Kids - Boys",
    "KIDS|Shirts": "Kids - Boys",
    "KIDS|Jeans": "Kids - Boys",
    "KIDS|Trousers": "Kids - Boys",
    "KIDS|Shorts": "Kids - Boys",
    "KIDS|Ethnic Wear": "Kids - Boys",
    "KIDS|Dresses": "Kids - Girls",
    "KIDS|Tops": "Kids - Girls",
    "KIDS|Skirts": "Kids - Girls",
    "KIDS|Casual Shoes": "Kids - Footwear",
    "KIDS|Sports Shoes": "Kids - Footwear",
    "KIDS|Sandals": "Kids - Footwear",
    "KIDS|School Shoes": "Kids - Footwear",
    "KIDS|Bags": "Kids - Accessories",
    "KIDS|Watches": "Kids - Accessories",
    "KIDS|Sunglasses": "Kids - Accessories",
    "KIDS|Hair Accessories": "Kids - Accessories",
    "KIDS|Action Figures": "Kids - Toys & Games",
    "KIDS|Educational Toys": "Kids - Toys & Games",
    "KIDS|Games": "Kids - Toys & Games",
    "KIDS|Soft Toys": "Kids - Toys & Games",
  };

  const categoryName =
    categoryMap[`${activeCategory}|${item}`] ?? activeCategory;

  return (
    <Link
      key={item}
      href={`/products?category=${encodeURIComponent(categoryName)}`}
      className="text-sm text-neutral-600 transition hover:text-brand dark:text-neutral-300"
      onClick={() => setActiveCategory(null)}
    >
      {item}
    </Link>
  );
})}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-md p-2 text-xl md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-outline-variant bg-surface px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
          <nav className="flex flex-col gap-1 text-body-md">

            <Link
              href="/products"
              className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
              onClick={closeMobileMenu}
            >
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
                  onClick={closeMobileMenu}
                >
                  Orders
                </Link>

                <Link
                  href="/wishlist"
                  className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
                  onClick={closeMobileMenu}
                >
                  Wishlist
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center justify-between rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
                  onClick={closeMobileMenu}
                >
                  <span>Cart</span>

                  {itemCount > 0 && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-label-sm text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>

                <div className="rounded-md px-3 py-3">
                  <NotificationBell />
                </div>

                <Link
                  href="/profile"
                  className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
                  onClick={closeMobileMenu}
                >
                  {user?.full_name?.split(" ")[0] ?? "Profile"}
                </Link>

                {(user?.role === "admin" ||
                  user?.role === "super_admin") && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-outline-variant px-3 py-3 dark:border-neutral-700"
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-3 hover:bg-brand/10 hover:text-brand"
                  onClick={closeMobileMenu}
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  className="mt-2 rounded-lg bg-brand px-3 py-3 text-center font-medium text-white transition hover:bg-brand-dark"
                  onClick={closeMobileMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}