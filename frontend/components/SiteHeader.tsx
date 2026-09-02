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
import { getMediaUrl } from "@/lib/media";
import { NotificationBell } from "./NotificationBell";

/*
 * ============================================================
 * NAV IMAGES
 * ============================================================
 *
 * The MEN/WOMEN/KIDS tabs (and most of their sections) reuse a real
 * product photo already in the catalog. HOME/BEAUTY/GENZ/STUDIO — and
 * a few sections like Women's Footwear or Kids' Toys — have zero
 * products in the catalog at all, so there's no product photo to
 * borrow; those instead point at /media/categories/<key>.jpg, real
 * stock photos downloaded once by backend/fetch_nav_images.py.
 */

const CATEGORY_TAB_IMAGES: Record<string, string> = {
  MEN: "/media/products/f083e4d0-3053-4a71-b50a-577f60fb8270/ultra-light-down-puffer-jacket-1.jpg",
  WOMEN: "/media/products/ef0b7ef9-68bb-41b4-adb5-c7fba8497cd8/satin-wrap-midi-dress-1.jpg",
  KIDS: "/media/products/10b0a4db-b8ec-4b6e-bf87-9fb18c027d2f/junior-track-suit-set-1.jpg",
  HOME: "/media/categories/tab-home.jpg",
  BEAUTY: "/media/categories/tab-beauty.jpg",
  GENZ: "/media/categories/tab-genz.jpg",
  STUDIO: "/media/categories/tab-studio.jpg",
};

const SECTION_IMAGES: Record<string, Record<string, string>> = {
  MEN: {
    TOPWEAR: "/media/products/b1945348-f80a-4c91-a473-419d35ae2329/regular-fit-oxford-shirt-1.jpg",
    BOTTOMWEAR: "/media/products/8b616c19-5f67-4500-9f73-0bc2a2baee6f/511-slim-fit-jeans-1.jpg",
    FOOTWEAR: "/media/products/b9d1e600-db54-4e95-bc08-4ee2fcf78e94/air-runner-sneakers-1.jpg",
    "SPORTS & ACTIVE WEAR": "/media/products/033a5002-cd29-4b6f-ae66-1e03523dbd8d/dri-fit-training-tee-1.jpg",
    "FASHION ACCESSORIES": "/media/products/fb7d9c89-bc5a-4dd3-93aa-ca33f2774974/aviator-classic-sunglasses-1.jpg",
  },
  WOMEN: {
    TOPWEAR: "/media/products/8e50fca2-f999-4076-a468-42b9ce1568d1/tailored-single-breasted-blazer-1.jpg",
    BOTTOMWEAR: "/media/products/5ddbdce6-839e-4d92-b324-19c525cebe41/501-high-rise-jeans-1.jpg",
    "INDIAN & FUSION WEAR": "/media/products/8fa31b26-ede6-4c45-b78b-e99ab99fb5de/embroidered-kurta-set-1.jpg",
    FOOTWEAR: "/media/categories/women-footwear.jpg",
    "FASHION ACCESSORIES": "/media/products/b605a927-759a-4e87-916d-c143c2445e39/round-metal-sunglasses-1.jpg",
  },
  KIDS: {
    BOYS: "/media/products/3acbe051-1248-4677-9a43-e2dbef5fe787/cotton-graphic-print-tee-1.jpg",
    GIRLS: "/media/products/c77f9d88-51fe-4924-b792-67fc4326220e/denim-dungaree-overalls-1.jpg",
    FOOTWEAR: "/media/products/71db77aa-e360-45ad-912f-afca6b395d78/junior-running-shoes-1.jpg",
    "TOYS & GAMES": "/media/categories/kids-toys-games.jpg",
    ACCESSORIES: "/media/categories/kids-accessories.jpg",
  },
  HOME: {
    "HOME DECOR": "/media/categories/home-home-decor.jpg",
    BEDDING: "/media/categories/home-bedding.jpg",
    "BATH & FLOORING": "/media/categories/home-bath-flooring.jpg",
    KITCHEN: "/media/categories/home-kitchen.jpg",
    FURNITURE: "/media/categories/home-furniture.jpg",
  },
  BEAUTY: {
    MAKEUP: "/media/categories/beauty-makeup.jpg",
    SKINCARE: "/media/categories/beauty-skincare.jpg",
    HAIRCARE: "/media/categories/beauty-haircare.jpg",
    FRAGRANCES: "/media/categories/beauty-fragrances.jpg",
    "BATH & BODY": "/media/categories/beauty-bath-body.jpg",
  },
  GENZ: {
    TRENDING: "/media/categories/genz-trending.jpg",
    STREETWEAR: "/media/categories/genz-streetwear.jpg",
    FOOTWEAR: "/media/categories/genz-footwear.jpg",
    ACCESSORIES: "/media/categories/genz-accessories.jpg",
    "STYLE PICKS": "/media/categories/genz-style-picks.jpg",
  },
  STUDIO: {
    "FASHION STORIES": "/media/categories/studio-fashion-stories.jpg",
    "TRENDING LOOKS": "/media/categories/studio-trending-looks.jpg",
    "STYLE GUIDE": "/media/categories/studio-style-guide.jpg",
    "NEW ARRIVALS": "/media/categories/studio-new-arrivals.jpg",
  },
};

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

  /*
   * ============================================================
   * CATEGORY MENU
   * ============================================================
   */

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
      ACCESSORIES: [
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

  /*
   * ============================================================
   * PARENT CATEGORY SLUG
   * ============================================================
   */

  const getCategorySlug = (category: string): string => {
    const categorySlugs: Record<string, string> = {
      MEN: "men",
      WOMEN: "women",
      KIDS: "kids",
      HOME: "home",
      BEAUTY: "beauty",
      GENZ: "genz",
      STUDIO: "studio",
    };

    return categorySlugs[category] ?? category.toLowerCase();
  };

  /*
   * ============================================================
   * SUBCATEGORY SLUG
   * ============================================================
   *
   * This is what connects the menu option to Product.subcategory.
   *
   * Example:
   *
   * Casual Shirts
   *      ↓
   * category=men-shirts
   * subcategory=casual-shirts
   *
   */

  const getSubcategorySlug = (
    mainCategory: string,
    item: string
  ): string => {
    const mappings: Record<string, Record<string, string>> = {
      MEN: {
        "T-Shirts": "t-shirts",
        Shirts: "shirts",
        "Casual Shirts": "casual-shirts",
        "Formal Shirts": "formal-shirts",
        Sweatshirts: "sweatshirts",
        Sweaters: "sweaters",
        Jackets: "jackets",
        "Blazers & Coats": "blazers-coats",

        Jeans: "jeans",
        "Casual Trousers": "casual-trousers",
        "Formal Trousers": "formal-trousers",
        Shorts: "shorts",
        "Track Pants & Joggers": "track-pants-joggers",

        "Casual Shoes": "casual-shoes",
        "Sports Shoes": "sports-shoes",
        "Formal Shoes": "formal-shoes",
        Sneakers: "sneakers",
        "Sandals & Floaters": "sandals-floaters",
        "Flip Flops": "flip-flops",

        "Sports Sandals": "sports-sandals",
        "Active T-Shirts": "active-t-shirts",
        "Track Pants & Shorts": "track-pants-shorts",
        Tracksuits: "tracksuits",
        "Sports Accessories": "sports-accessories",

        Wallets: "wallets",
        Belts: "belts",
        Sunglasses: "sunglasses",
        Watches: "watches",
        "Caps & Hats": "caps-hats",
        "Bags & Backpacks": "bags-backpacks",
      },

      WOMEN: {
        "T-Shirts": "t-shirts",
        Tops: "tops",
        Shirts: "shirts",
        Kurtas: "kurtas",
        Tunics: "tunics",
        Dresses: "dresses",
        Sweaters: "sweaters",
        Jackets: "jackets",

        Jeans: "jeans",
        Trousers: "trousers",
        Shorts: "shorts",
        Skirts: "skirts",
        Leggings: "leggings",

        "Kurtas & Suits": "kurtas-suits",
        Sarees: "sarees",
        "Ethnic Dresses": "ethnic-dresses",
        "Lehenga Choli": "lehenga-choli",
        Palazzos: "palazzos",

        "Casual Shoes": "casual-shoes",
        "Sports Shoes": "sports-shoes",
        Flats: "flats",
        Heels: "heels",
        Sandals: "sandals",
        Boots: "boots",

        Handbags: "handbags",
        Jewellery: "jewellery",
        Watches: "watches",
        Sunglasses: "sunglasses",
        Belts: "belts",
      },

      KIDS: {
        "T-Shirts": "t-shirts",
        Shirts: "shirts",
        Jeans: "jeans",
        Trousers: "trousers",
        Shorts: "shorts",
        "Ethnic Wear": "ethnic-wear",

        Dresses: "dresses",
        Tops: "tops",
        Skirts: "skirts",

        "Casual Shoes": "casual-shoes",
        "Sports Shoes": "sports-shoes",
        Sandals: "sandals",
        "School Shoes": "school-shoes",

        "Action Figures": "action-figures",
        "Educational Toys": "educational-toys",
        Games: "games",
        "Soft Toys": "soft-toys",

        Bags: "bags",
        Watches: "watches",
        Sunglasses: "sunglasses",
        "Hair Accessories": "hair-accessories",
      },

      HOME: {
        "Wall Decor": "wall-decor",
        Clocks: "clocks",
        Mirrors: "mirrors",
        "Photo Frames": "photo-frames",
        Candles: "candles",

        Bedsheets: "bedsheets",
        "Bed Covers": "bed-covers",
        Blankets: "blankets",
        Pillows: "pillows",

        "Bath Towels": "bath-towels",
        "Bath Mats": "bath-mats",
        "Floor Mats": "floor-mats",
        Rugs: "rugs",

        Cookware: "cookware",
        "Kitchen Storage": "kitchen-storage",
        Dinnerware: "dinnerware",
        "Kitchen Tools": "kitchen-tools",

        Chairs: "chairs",
        Tables: "tables",
        Storage: "storage",
        "Home Office": "home-office",
      },

      BEAUTY: {
        Lipstick: "lipstick",
        "Lip Gloss": "lip-gloss",
        Foundation: "foundation",
        Kajal: "kajal",
        Mascara: "mascara",

        "Face Wash": "face-wash",
        Moisturizers: "moisturizers",
        Serums: "serums",
        Sunscreen: "sunscreen",

        Shampoo: "shampoo",
        Conditioner: "conditioner",
        "Hair Oil": "hair-oil",
        "Hair Styling": "hair-styling",

        Perfumes: "perfumes",
        "Body Mists": "body-mists",
        Deodorants: "deodorants",

        "Body Wash": "body-wash",
        "Body Lotion": "body-lotion",
        "Hand & Foot Care": "hand-foot-care",
      },

      GENZ: {
        "Trending Now": "trending-now",
        "New Arrivals": "new-arrivals",
        "Best Sellers": "best-sellers",
        "Viral Styles": "viral-styles",

        Oversized: "oversized",
        "Graphic Tees": "graphic-tees",
        "Cargo Pants": "cargo-pants",
        Streetwear: "streetwear",

        Sneakers: "sneakers",
        "Chunky Shoes": "chunky-shoes",
        "Casual Shoes": "casual-shoes",

        Caps: "caps",
        Sunglasses: "sunglasses",
        Jewellery: "jewellery",
        Bags: "bags",

        "Party Wear": "party-wear",
        "College Wear": "college-wear",
        "Weekend Looks": "weekend-looks",
      },

      STUDIO: {
        "Style Guide": "style-guide",
        "Fashion Trends": "fashion-trends",
        "Celebrity Style": "celebrity-style",

        "Street Style": "street-style",
        "Festive Looks": "festive-looks",
        "Party Looks": "party-looks",

        "What to Wear": "what-to-wear",
        "How to Style": "how-to-style",
        "Outfit Ideas": "outfit-ideas",

        "Latest Fashion": "latest-fashion",
        "New Collections": "new-collections",
        "Editor's Picks": "editors-picks",
      },
    };

    return (
      mappings[mainCategory]?.[item] ??
      item
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/\s+/g, "-")
    );
  };

  /*
   * ============================================================
   * MENU LINK
   * ============================================================
   */

  const getMenuLink = (
    mainCategory: string,
    item: string
  ): string => {
    const categoryMap: Record<string, Record<string, string>> = {
      MEN: {
        "T-Shirts": "men-t-shirts",
        Shirts: "men-shirts",
        "Casual Shirts": "men-shirts",
        "Formal Shirts": "men-shirts",
        Sweatshirts: "men-jackets",
        Sweaters: "men-jackets",
        Jackets: "men-jackets",
        "Blazers & Coats": "men-jackets",

        Jeans: "men-jeans",
        "Casual Trousers": "men-trousers",
        "Formal Trousers": "men-trousers",
        Shorts: "men-sports-activewear",
        "Track Pants & Joggers": "men-sports-activewear",

        "Casual Shoes": "men-footwear",
        "Sports Shoes": "men-footwear",
        "Formal Shoes": "men-footwear",
        Sneakers: "men-footwear",
        "Sandals & Floaters": "men-footwear",
        "Flip Flops": "men-footwear",

        "Sports Sandals": "men-sports-activewear",
        "Active T-Shirts": "men-sports-activewear",
        "Track Pants & Shorts": "men-sports-activewear",
        Tracksuits: "men-sports-activewear",
        "Sports Accessories": "men-sports-activewear",

        Wallets: "men-accessories",
        Belts: "men-accessories",
        Sunglasses: "men-accessories",
        Watches: "men-accessories",
        "Caps & Hats": "men-accessories",
        "Bags & Backpacks": "men-accessories",
      },

      WOMEN: {
        "T-Shirts": "women-tops",
        Tops: "women-tops",
        Shirts: "women-tops",
        Kurtas: "women-kurtas",
        Tunics: "women-tops",
        Dresses: "women-dresses",
        Sweaters: "women-tops",
        Jackets: "women-tops",

        Jeans: "women-jeans",
        Trousers: "women-trousers",
        Shorts: "women-trousers",
        Skirts: "women-trousers",
        Leggings: "women-trousers",

        "Kurtas & Suits": "women-kurtas",
        Sarees: "women-sarees",
        "Ethnic Dresses": "women-dresses",
        "Lehenga Choli": "women-kurtas",
        Palazzos: "women-trousers",

        "Casual Shoes": "women-footwear",
        "Sports Shoes": "women-footwear",
        Flats: "women-footwear",
        Heels: "women-footwear",
        Sandals: "women-footwear",
        Boots: "women-footwear",

        Handbags: "women-handbags",
        Jewellery: "women-accessories",
        Watches: "women-accessories",
        Sunglasses: "women-accessories",
        Belts: "women-accessories",
      },

      KIDS: {
        "T-Shirts": "kids-boys",
        Shirts: "kids-boys",
        Jeans: "kids-boys",
        Trousers: "kids-boys",
        Shorts: "kids-boys",
        "Ethnic Wear": "kids-boys",

        Dresses: "kids-girls",
        Tops: "kids-girls",
        Skirts: "kids-girls",

        "Casual Shoes": "kids-footwear",
        "Sports Shoes": "kids-footwear",
        Sandals: "kids-footwear",
        "School Shoes": "kids-footwear",

        "Action Figures": "kids-toys-games",
        "Educational Toys": "kids-toys-games",
        Games: "kids-toys-games",
        "Soft Toys": "kids-toys-games",

        Bags: "kids-accessories",
        Watches: "kids-accessories",
        Sunglasses: "kids-accessories",
        "Hair Accessories": "kids-accessories",
      },

      HOME: {
        "Wall Decor": "home-home-decor",
        Clocks: "home-home-decor",
        Mirrors: "home-home-decor",
        "Photo Frames": "home-home-decor",
        Candles: "home-home-decor",

        Bedsheets: "home-bedding",
        "Bed Covers": "home-bedding",
        Blankets: "home-bedding",
        Pillows: "home-bedding",

        "Bath Towels": "home-bath-flooring",
        "Bath Mats": "home-bath-flooring",
        "Floor Mats": "home-bath-flooring",
        Rugs: "home-bath-flooring",

        Cookware: "home-kitchen",
        "Kitchen Storage": "home-kitchen",
        Dinnerware: "home-kitchen",
        "Kitchen Tools": "home-kitchen",

        Chairs: "home-furniture",
        Tables: "home-furniture",
        Storage: "home-furniture",
        "Home Office": "home-furniture",
      },

      BEAUTY: {
        Lipstick: "beauty-makeup",
        "Lip Gloss": "beauty-makeup",
        Foundation: "beauty-makeup",
        Kajal: "beauty-makeup",
        Mascara: "beauty-makeup",

        "Face Wash": "beauty-skincare",
        Moisturizers: "beauty-skincare",
        Serums: "beauty-skincare",
        Sunscreen: "beauty-skincare",

        Shampoo: "beauty-haircare",
        Conditioner: "beauty-haircare",
        "Hair Oil": "beauty-haircare",
        "Hair Styling": "beauty-haircare",

        Perfumes: "beauty-fragrances",
        "Body Mists": "beauty-fragrances",
        Deodorants: "beauty-fragrances",

        "Body Wash": "beauty-bath-body",
        "Body Lotion": "beauty-bath-body",
        "Hand & Foot Care": "beauty-bath-body",
      },
    };

    const categorySlug =
      categoryMap[mainCategory]?.[item] ??
      getCategorySlug(mainCategory);

    const subcategorySlug = getSubcategorySlug(
      mainCategory,
      item
    );

    return `/products?category=${encodeURIComponent(
      categorySlug
    )}&subcategory=${encodeURIComponent(
      subcategorySlug
    )}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-4 py-3 sm:px-gutter">

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

          <span className="ml-2 font-bold text-2xl text-pink-500">
            ShopSphere
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-end gap-4 md:flex">
          <div className="flex items-center gap-3 text-sm font-semibold xl:gap-4">
            {Object.keys(categories).map((category) => (
              <div
                key={category}
                className="relative py-5"
                onMouseEnter={() =>
                  setActiveCategory(category)
                }
              >
                <Link
                  href={`/products?category=${getCategorySlug(
                    category
                  )}`}
                  className={`flex items-center gap-1 whitespace-nowrap hover:text-brand ${
                    activeCategory === category
                      ? "text-brand"
                      : ""
                  }`}
                >
                  <span className="relative hidden h-4 w-4 shrink-0 overflow-hidden rounded-full border border-outline-variant dark:border-neutral-700 xl:inline-block">
                    <Image
                      src={getMediaUrl(CATEGORY_TAB_IMAGES[category])!}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="16px"
                    />
                  </span>
                  {category}
                </Link>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-36 xl:w-64">
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

          {/* User actions */}
          <div className="flex items-center gap-4">
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

        {/* =====================================================
            DESKTOP MEGA MENU
           ===================================================== */}

        {activeCategory && (
          <div
            className="absolute left-0 right-0 top-full z-50 border-t border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
            onMouseEnter={() =>
              setActiveCategory(activeCategory)
            }
            onMouseLeave={() =>
              setActiveCategory(null)
            }
          >
            <div className="mx-auto max-w-container-max px-8 py-8">
              <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">

                {Object.entries(
                  categories[
                    activeCategory as keyof typeof categories
                  ]
                ).map(([section, items]) => (
                  <div key={section}>
                    {SECTION_IMAGES[activeCategory]?.[section] && (
                      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                        <Image
                          src={getMediaUrl(SECTION_IMAGES[activeCategory][section])!}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="180px"
                        />
                      </div>
                    )}

                    <h3 className="mb-3 text-xs font-bold text-brand">
                      {section}
                    </h3>

                    <div className="flex flex-col gap-2">
                      {items.map((item) => (
                        <Link
                          key={`${activeCategory}-${item}`}
                          href={getMenuLink(
                            activeCategory,
                            item
                          )}
                          className="text-sm text-neutral-600 transition hover:text-brand dark:text-neutral-300"
                          onClick={() =>
                            setActiveCategory(null)
                          }
                        >
                          {item}
                        </Link>
                      ))}
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
          aria-label={
            mobileMenuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen((open) => !open)
          }
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
         ===================================================== */}

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
                  {user?.full_name?.split(" ")[0] ??
                    "Profile"}
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