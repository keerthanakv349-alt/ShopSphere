"use client";

/**
 * FRONTEND FLOW FOR SIGNUP (mirrors the backend docstring in auth.py):
 * 1. React Hook Form manages field state + touched/error state without
 *    re-rendering the whole form on every keystroke (uncontrolled inputs
 *    under the hood) — matters for form-heavy e-commerce checkout flows.
 * 2. zodResolver runs our shared `signupSchema` (lib/validation.ts) on
 *    submit, giving inline errors that mirror the backend's own rules —
 *    but this is UX sugar only; the backend independently re-validates.
 * 3. useMutation (React Query) wraps the actual POST /auth/signup call:
 *    gives us isPending/isError/onSuccess without hand-rolled state.
 * 4. On success: store user+tokens in Zustand (persisted), toast, redirect.
 * 5. On error (e.g. 409 duplicate email): surface the backend's message.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signup } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { signupSchema, type SignupFormValues } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome, ${data.user.full_name}!`);
      router.push("/");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Signup failed. Please try again.");
    },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            {...register("full_name")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Jane Doe"
          />
          {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
        </div>

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
            placeholder="At least 8 characters"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {mutation.isPending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
