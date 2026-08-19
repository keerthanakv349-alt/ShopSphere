



// "use client";

// import { useQuery } from "@tanstack/react-query";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   FiArrowLeft,
//   FiChevronRight,
//   FiMapPin,
//   FiHeart,
//   FiPackage,
//   FiUser,
//   FiTag,
//   FiCreditCard,
//   FiThumbsUp,
//   FiAlertCircle,
//   FiHelpCircle,
//   FiInfo,
//   FiFileText,
//   FiShield,
//   FiRefreshCw,
//   FiSettings,
//   FiEdit2,
//   FiLogOut,
// } from "react-icons/fi";
// import toast from "react-hot-toast";

// import { fetchMe, logoutRequest } from "@/lib/auth";
// import { useAuthStore } from "@/lib/auth-store";
// import { ProtectedRoute } from "@/lib/protected-route";
// import { ErrorState } from "@/components/ErrorState";

// function ProfileContent() {
//   const router = useRouter();
//   const logout = useAuthStore((s) => s.logout);

//   const {
//     data: user,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["me"],
//     queryFn: fetchMe,
//   });

//   async function handleLogout() {
//     try {
//       await logoutRequest();
//     } finally {
//       logout();
//       router.push("/login");
//     }
//   }

//   function showComingSoon(feature: string) {
//     toast(`${feature} will be available soon.`);
//   }

//   if (isLoading) {
//     return (
//       <main className="min-h-screen bg-neutral-50 px-4 py-10">
//         <div className="mx-auto max-w-md text-center">
//           <p className="text-sm text-neutral-500">Loading profile...</p>
//         </div>
//       </main>
//     );
//   }

//   if (isError) {
//     return (
//       <main className="min-h-screen bg-neutral-50 px-4 py-10">
//         <div className="mx-auto max-w-md">
//           <ErrorState error={error} onRetry={refetch} />
//         </div>
//       </main>
//     );
//   }

//   const fullName = user?.full_name || "Customer";
//   const email = user?.email || "";
//   const firstLetter = fullName.charAt(0).toUpperCase();

//   return (
//     <main className="min-h-screen bg-neutral-50 px-4 py-6">
//       <div className="mx-auto w-full max-w-2xl">
//         {/* Header */}
//         <div className="mb-6 flex items-center gap-4">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100"
//             aria-label="Go back"
//           >
//             <FiArrowLeft size={20} />
//           </button>

//           <div>
//             <h1 className="text-2xl font-bold text-neutral-900">
//               My Profile
//             </h1>
//             <p className="text-sm text-neutral-500">
//               Manage your ShopSphere account
//             </p>
//           </div>
//         </div>

//         {/* Profile Card */}
//         <section className="mb-7 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between gap-4">
//             <div className="flex min-w-0 items-center gap-4">
//               <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
//                 {firstLetter}
//               </div>

//               <div className="min-w-0">
//                 <h2 className="truncate text-lg font-bold text-neutral-900">
//                   {fullName}
//                 </h2>

//                 <p className="truncate text-sm text-neutral-500">
//                   {email}
//                 </p>

//                 <p className="mt-1 text-xs capitalize text-neutral-400">
//                   {user?.role || "Customer"}
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() => showComingSoon("Profile editing")}
//               className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
//             >
//               <FiEdit2 size={16} />
//               <span className="hidden sm:inline">Edit</span>
//             </button>
//           </div>
//         </section>

//         {/* Shopping */}
//         <ProfileSection title="SHOPPING">
//           <ProfileItem
//             icon={<FiPackage />}
//             title="My Orders"
//             description="Track and manage your orders"
//             href="/orders"
//           />

//           <ProfileItem
//             icon={<FiHeart />}
//             title="Wishlist"
//             description="Your saved products"
//             onClick={() => showComingSoon("Wishlist")}
//           />

//           <ProfileItem
//             icon={<FiUser />}
//             title="My Profile"
//             description="View your personal information"
//             href="/profile"
//             active
//           />
//         </ProfileSection>

//         {/* Account */}
//         <ProfileSection title="ACCOUNT">
//           <ProfileItem
//   icon={<FiMapPin />}
//   title="Addresses"
//   description="Manage your delivery addresses"
//   href="/addresses"
// />

//           <ProfileItem
//             icon={<FiTag />}
//             title="My Coupons"
//             description="View available coupons and offers"
//             onClick={() => showComingSoon("Coupons")}
//           />

//           <ProfileItem
//             icon={<FiCreditCard />}
//             title="ShopSphere Wallet"
//             description="Manage your wallet and balance"
//             onClick={() => showComingSoon("ShopSphere Wallet")}
//           />
//         </ProfileSection>

//         {/* Feedback & Help */}
//         <ProfileSection title="FEEDBACK & HELP">
//           <ProfileItem
//             icon={<FiThumbsUp />}
//             title="Rate App"
//             description="Tell us what you think"
//             onClick={() => showComingSoon("App rating")}
//           />

//           <ProfileItem
//             icon={<FiAlertCircle />}
//             title="Report App Issue"
//             description="Report a problem with the app"
//             onClick={() => showComingSoon("Issue reporting")}
//           />

//           <ProfileItem
//             icon={<FiHelpCircle />}
//             title="Help Desk"
//             description="Get help with your ShopSphere account"
//             onClick={() => showComingSoon("Help Desk")}
//           />
//         </ProfileSection>

//         {/* More */}
//         <ProfileSection title="MORE">
//           <ProfileItem
//             icon={<FiInfo />}
//             title="About Us"
//             description="Learn more about ShopSphere"
//             onClick={() => showComingSoon("About Us")}
//           />

//           <ProfileItem
//             icon={<FiFileText />}
//             title="Terms & Conditions"
//             description="Read our terms and conditions"
//             onClick={() => showComingSoon("Terms & Conditions")}
//           />

//           <ProfileItem
//             icon={<FiShield />}
//             title="Privacy Policy"
//             description="Learn how we protect your information"
//             onClick={() => showComingSoon("Privacy Policy")}
//           />

//           <ProfileItem
//             icon={<FiRefreshCw />}
//             title="Refund Policy"
//             description="Learn about refunds and returns"
//             onClick={() => showComingSoon("Refund Policy")}
//           />

//           <ProfileItem
//             icon={<FiSettings />}
//             title="Settings"
//             description="Manage your account settings"
//             onClick={() => showComingSoon("Settings")}
//           />
//         </ProfileSection>

//         {/* Logout */}
//         <button
//           type="button"
//           onClick={handleLogout}
//           className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
//         >
//           <FiLogOut size={18} />
//           Log out
//         </button>

//         <p className="pb-6 text-center text-xs text-neutral-400">
//           ShopSphere
//         </p>
//       </div>
//     </main>
//   );
// }

// /* ---------------------------------------------
//    Reusable section
// ---------------------------------------------- */

// function ProfileSection({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="mb-7">
//       <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-neutral-400">
//         {title}
//       </h2>

//       <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
//         {children}
//       </div>
//     </section>
//   );
// }

// /* ---------------------------------------------
//    Reusable profile menu item
// ---------------------------------------------- */

// function ProfileItem({
//   icon,
//   title,
//   description,
//   href,
//   onClick,
//   active = false,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   href?: string;
//   onClick?: () => void;
//   active?: boolean;
// }) {
//   const content = (
//     <div
//       className={`flex items-center gap-4 px-5 py-4 transition ${
//         active ? "bg-neutral-50" : "hover:bg-neutral-50"
//       }`}
//     >
//       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
//         {icon}
//       </div>

//       <div className="min-w-0 flex-1">
//         <p className="text-sm font-semibold text-neutral-900">{title}</p>

//         <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
//       </div>

//       <FiChevronRight
//         size={18}
//         className="shrink-0 text-neutral-400"
//       />
//     </div>
//   );

//   if (href) {
//     return <Link href={href}>{content}</Link>;
//   }

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className="block w-full text-left"
//     >
//       {content}
//     </button>
//   );
// }

// /* ---------------------------------------------
//    Protected Profile Page
// ---------------------------------------------- */

// export default function ProfilePage() {
//   return (
//     <ProtectedRoute>
//       <ProfileContent />
//     </ProtectedRoute>
//   );
// }


"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiChevronRight,
  FiMapPin,
  FiHeart,
  FiPackage,
  FiUser,
  FiTag,
  FiCreditCard,
  FiThumbsUp,
  FiAlertCircle,
  FiHelpCircle,
  FiInfo,
  FiFileText,
  FiShield,
  FiRefreshCw,
  FiSettings,
  FiEdit2,
  FiLogOut,
} from "react-icons/fi";

import { fetchMe, logoutRequest } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";

function ProfileContent() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      logout();
      router.push("/login");
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm text-neutral-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="mx-auto max-w-md">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      </main>
    );
  }

  const fullName = user?.full_name || "Customer";
  const email = user?.email || "";
  const firstLetter = fullName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              My Profile
            </h1>

            <p className="text-sm text-neutral-500">
              Manage your ShopSphere account
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <section className="mb-7 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">

            <div className="flex min-w-0 items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
                {firstLetter}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-neutral-900">
                  {fullName}
                </h2>

                <p className="truncate text-sm text-neutral-500">
                  {email}
                </p>

                <p className="mt-1 text-xs capitalize text-neutral-400">
                  {user?.role || "Customer"}
                </p>
              </div>

            </div>

            {/* Real profile page */}
            <Link
              href="/profile/edit"
              className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <FiEdit2 size={16} />

              <span className="hidden sm:inline">
                Edit
              </span>
            </Link>

          </div>
        </section>

        {/* Shopping */}
        <ProfileSection title="SHOPPING">

          <ProfileItem
            icon={<FiPackage />}
            title="My Orders"
            description="Track and manage your orders"
            href="/orders"
          />

          {/* REAL WISHLIST */}
          <ProfileItem
            icon={<FiHeart />}
            title="Wishlist"
            description="Your saved products"
            href="/wishlist"
          />

          {/* Current profile */}
          <ProfileItem
            icon={<FiUser />}
            title="My Profile"
            description="View your personal information"
            href="/profile"
            active
          />

        </ProfileSection>

        {/* Account */}
        <ProfileSection title="ACCOUNT">

          {/* Already implemented */}
          <ProfileItem
            icon={<FiMapPin />}
            title="Addresses"
            description="Manage your delivery addresses"
            href="/addresses"
          />

          {/* Coupons route */}
          <ProfileItem
            icon={<FiTag />}
            title="My Coupons"
            description="View available coupons and offers"
            href="/coupons"
          />

          {/* Wallet route */}
          <ProfileItem
            icon={<FiCreditCard />}
            title="ShopSphere Wallet"
            description="Manage your wallet and balance"
            href="/wallet"
          />

        </ProfileSection>

        {/* Feedback & Help */}
        <ProfileSection title="FEEDBACK & HELP">

          <ProfileItem
            icon={<FiThumbsUp />}
            title="Rate App"
            description="Tell us what you think"
            href="/rate-app"
          />

          <ProfileItem
            icon={<FiAlertCircle />}
            title="Report App Issue"
            description="Report a problem with the app"
            href="/report-issue"
          />

          <ProfileItem
            icon={<FiHelpCircle />}
            title="Help Desk"
            description="Get help with your ShopSphere account"
            href="/help"
          />

        </ProfileSection>

        {/* More */}
        <ProfileSection title="MORE">

          <ProfileItem
            icon={<FiInfo />}
            title="About Us"
            description="Learn more about ShopSphere"
            href="/about"
          />

          <ProfileItem
            icon={<FiFileText />}
            title="Terms & Conditions"
            description="Read our terms and conditions"
            href="/terms"
          />

          <ProfileItem
            icon={<FiShield />}
            title="Privacy Policy"
            description="Learn how we protect your information"
            href="/privacy"
          />

          <ProfileItem
            icon={<FiRefreshCw />}
            title="Refund Policy"
            description="Learn about refunds and returns"
            href="/refund-policy"
          />

          <ProfileItem
            icon={<FiSettings />}
            title="Settings"
            description="Manage your account settings"
            href="/settings"
          />

        </ProfileSection>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <FiLogOut size={18} />
          Log out
        </button>

        <p className="pb-6 text-center text-xs text-neutral-400">
          ShopSphere
        </p>

      </div>
    </main>
  );
}

/* ---------------------------------------------
   Reusable section
---------------------------------------------- */

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">

      <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-neutral-400">
        {title}
      </h2>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {children}
      </div>

    </section>
  );
}

/* ---------------------------------------------
   Reusable profile menu item
---------------------------------------------- */

function ProfileItem({
  icon,
  title,
  description,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className="block w-full">

      <div
        className={`flex items-center gap-4 px-5 py-4 transition ${
          active
            ? "bg-neutral-50"
            : "hover:bg-neutral-50"
        }`}
      >

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-semibold text-neutral-900">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-neutral-500">
            {description}
          </p>

        </div>

        <FiChevronRight
          size={18}
          className="shrink-0 text-neutral-400"
        />

      </div>

    </Link>
  );
}

/* ---------------------------------------------
   Protected Profile Page
---------------------------------------------- */

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
} 
