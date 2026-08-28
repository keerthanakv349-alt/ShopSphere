import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-neutral-50 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">

      <div className="mx-auto max-w-container-max px-4 py-12 sm:px-gutter">


<div className="mb-10">
  <Link
    href="/"
    className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-brand"
  >
    {/* <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white">
      S
    </span> */}
    <Image
  src="/images/logo.png"
  alt="ShopSphere"
  width={42}
  height={42}
  className="h-10 w-10 object-contain"
/>
    ShopSphere
  </Link>

  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
    Fashion & Lifestyle
  </p>
</div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ONLINE SHOPPING */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-wide text-neutral-900 dark:text-neutral-100">
              ONLINE SHOPPING
            </h2>

            <nav className="flex flex-col gap-2">
              <Link href="/products" className="hover:text-brand">
                Men
              </Link>
              <Link href="/products" className="hover:text-brand">
                Women
              </Link>
              <Link href="/products" className="hover:text-brand">
                Kids
              </Link>
              <Link href="/products" className="hover:text-brand">
                Home
              </Link>
              <Link href="/products" className="hover:text-brand">
                Beauty
              </Link>
              <Link href="/coupons" className="hover:text-brand">
                Coupons
              </Link>
            </nav>
          </div>

          {/* CUSTOMER POLICIES */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-wide text-neutral-900 dark:text-neutral-100">
              CUSTOMER POLICIES
            </h2>

            <nav className="flex flex-col gap-2">
              <Link href="/help" className="hover:text-brand">
                Help Desk
              </Link>
              <Link href="/orders" className="hover:text-brand">
                Track Orders
              </Link>
              <Link href="/refund-policy" className="hover:text-brand">
                Refund Policy
              </Link>
              <Link href="/privacy" className="hover:text-brand">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-brand">
                Terms & Conditions
              </Link>
              <Link href="/report-issue" className="hover:text-brand">
                Report an Issue
              </Link>
            </nav>
          </div>

          {/* SHOPSPHERE */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-wide text-neutral-900 dark:text-neutral-100">
              SHOPSPHERE
            </h2>

            <nav className="flex flex-col gap-2">
              <Link href="/about" className="hover:text-brand">
                About Us
              </Link>
              <Link href="/profile" className="hover:text-brand">
                My Account
              </Link>
              <Link href="/wishlist" className="hover:text-brand">
                Wishlist
              </Link>
              <Link href="/cart" className="hover:text-brand">
                Shopping Cart
              </Link>
              <Link href="/settings" className="hover:text-brand">
                Settings
              </Link>
              <Link href="/rate-app" className="hover:text-brand">
                Rate App
              </Link>
            </nav>
          </div>

          {/* EXPERIENCE */}
          <div>
            <h2 className="mb-4 text-xs font-bold tracking-wide text-neutral-900 dark:text-neutral-100">
              EXPERIENCE SHOPSPHERE
            </h2>

            <p className="mb-4 leading-6">
              Shop fashion, lifestyle products, and more with a simple and
              convenient shopping experience.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900">
                Secure Payments
              </span>

              <span className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900">
                Easy Returns
              </span>

              <span className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900">
                Fast Delivery
              </span>
            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="my-10 border-t border-neutral-200 dark:border-neutral-800" />

        {/* POPULAR SEARCHES */}
        <div>
          <h2 className="mb-4 text-xs font-bold tracking-wide text-neutral-900 dark:text-neutral-100">
            POPULAR SEARCHES
          </h2>

          <p className="leading-7">
            Dresses&nbsp; | &nbsp;T-Shirts&nbsp; | &nbsp;Shirts&nbsp; | &nbsp;Jeans&nbsp; |
            &nbsp;Shoes&nbsp; | &nbsp;Kurtas&nbsp; | &nbsp;Sarees&nbsp; | &nbsp;Watches&nbsp; |
            &nbsp;Bags&nbsp; | &nbsp;Beauty&nbsp; | &nbsp;Sportswear&nbsp; | &nbsp;Accessories&nbsp; |
            &nbsp;Home Decor
          </p>
        </div>

        {/* BOTTOM */}
        <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">

          {/* <p>
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p> */}

          <div className="flex items-center gap-3">
  <Link
    href="/"
    className="inline-flex items-center gap-2 font-bold text-brand"
  >
    {/* <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-white">
      S
    </span> */}
    <Image
  src="/images/logo.png"
  alt="ShopSphere"
  width={30}
  height={30}
  className="h-7 w-7 object-contain"
/>
    ShopSphere
  </Link>

  <span className="text-neutral-300">|</span>

  <p>
    © {new Date().getFullYear()} ShopSphere. All rights reserved.
  </p>
</div>

          <div className="flex gap-5">
            <Link href="/about" className="hover:text-brand">
              About
            </Link>

            <Link href="/help" className="hover:text-brand">
              Contact
            </Link>

            <Link href="/privacy" className="hover:text-brand">
              Privacy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
