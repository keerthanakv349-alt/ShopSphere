"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";

import { fetchMe, updateMe } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorState } from "@/components/ErrorState";

function EditProfileContent() {
  const router = useRouter();

  const storedUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const tokens = useAuthStore((s) => s.tokens);

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

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPhoneNumber(user.phone_number ?? "");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateMe,

    onSuccess: (updatedUser) => {
      if (tokens) {
        setAuth(updatedUser, tokens);
      }

      setSuccessMessage("Profile updated successfully.");
      setErrorMessage("");

      setTimeout(() => {
        router.push("/profile");
      }, 800);

      

      
    },

  

    onError: (error: any) => {
  console.error("PROFILE UPDATE ERROR:", error);
  console.error("STATUS:", error?.response?.status);
  console.error("DATA:", error?.response?.data);

  const responseData = error?.response?.data;

  let detail = "Unable to update your profile.";

  if (typeof responseData?.detail === "string") {
    detail = responseData.detail;
  } else if (Array.isArray(responseData?.detail)) {
    detail = responseData.detail
      .map((item: any) => item.msg)
      .join(", ");
  } else if (responseData?.message) {
    detail = responseData.message;
  }

  setErrorMessage(detail);
  setSuccessMessage("");
},
  });



  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("Full name must contain at least 2 characters.");
      return;
    }

    updateMutation.mutate({
      full_name: trimmedName,
      phone_number: trimmedPhone || null,
    });
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10">
        <div className="mx-auto max-w-xl text-center">
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
        <div className="mx-auto max-w-xl">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="mx-auto w-full max-w-xl">

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
              Edit Profile
            </h1>

            <p className="text-sm text-neutral-500">
              Update your personal information
            </p>
          </div>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        >

          {/* Full name */}
          <div className="mb-5">
            <label
              htmlFor="full_name"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Full Name
            </label>

            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              maxLength={120}
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={user?.email ?? storedUser?.email ?? ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500"
            />

            <p className="mt-1.5 text-xs text-neutral-400">
              Email changes require a separate verification process.
            </p>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label
              htmlFor="phone_number"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Phone Number
            </label>

            <input
              id="phone_number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              maxLength={20}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSave size={17} />

              {updateMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}