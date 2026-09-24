



"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";

import { login } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validation";
import { GiHoneyJar } from "react-icons/gi";

type LoginMode = "customer" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [loginMode, setLoginMode] =
    useState<LoginMode>("customer");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      const isAdmin =
        data.user.role === "admin" ||
        data.user.role === "super_admin";

      if (loginMode === "admin") {
        if (!isAdmin) {
          toast.error(
            "This account does not have administrator access."
          );
          return;
        }

        setAuth(data.user, data.tokens);
        toast.success(`Welcome, ${data.user.full_name}!`);
        router.push("/admin");
        return;
      }

      if (isAdmin) {
        toast.error(
          "Administrator accounts must use Admin Login."
        );
        return;
      }

      setAuth(data.user, data.tokens);
      toast.success(
        `Welcome back, ${data.user.full_name}!`
      );
      router.push("/");
    },

    onError: (
      error: AxiosError<{ detail: string }>
    ) => {
      toast.error(
        error.response?.data?.detail ??
          "Login failed. Please check your credentials."
      );
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-5 text-center">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight text-brand"
          >
            ShopSphere
          </Link>

          <p className="mt-1 text-sm text-neutral-500">
            Fashion & Lifestyle
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

          <div className="mb-5 text-center">
            <h1 className="text-2xl font-bold">
              Log in
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Sign in to your ShopSphere account
            </p>
          </div>

          {/* Customer / Admin Toggle */}
          <div className="mb-5">
            <p className="mb-2 text-sm font-medium">
              Login as
            </p>

            <div className="grid grid-cols-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setLoginMode("customer")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  loginMode === "customer"
                    ? "bg-white text-brand shadow-sm dark:bg-neutral-700"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setLoginMode("admin")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  loginMode === "admin"
                    ? "bg-white text-brand shadow-sm dark:bg-neutral-700"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit((values) =>
              mutation.mutate(values)
            )}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                {...register("email")}
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-900"
                placeholder="you@example.com"
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="password"
                {...register("password")}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-900"
                placeholder="Enter your password"
              />

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-1 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending
                ? "Signing in..."
                : loginMode === "admin"
                  ? "Login as Admin"
                  : "Login as Customer"}
            </button>
          </form>

          {/* Customer Signup */}
          {loginMode === "customer" && (
            <p className="mt-4 text-center text-sm text-neutral-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-brand hover:underline"
              >
                Sign up
              </Link>
            </p>
          )}

          {/* Admin Information */}
          {loginMode === "admin" && (
            <p className="mt-4 text-center text-xs text-neutral-500">
              Administrator access is restricted to
              authorized ShopSphere staff.
            </p>
          )}
        </div>

        {/* Back to Store */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-brand"
          >
            ← Back to ShopSphere
          </Link>
        </div>

      </div>
    </main>
  );
} 