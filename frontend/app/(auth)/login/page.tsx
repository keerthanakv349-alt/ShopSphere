"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { loginSchema, type LoginFormValues } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      router.push("/");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      // Backend deliberately returns the same message for "no such user"
      // and "wrong password" (see auth.py) to prevent email enumeration —
      // we just surface it as-is, no need to re-decide the copy here.
      toast.error(error.response?.data?.detail ?? "Login failed. Please try again.");
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="jane@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {mutation.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
