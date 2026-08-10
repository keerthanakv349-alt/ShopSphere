"use client";

/**
 * Global auth state via Zustand.
 *
 * WHY ZUSTAND HERE INSTEAD OF CONTEXT API:
 * Auth state (current user, tokens) is read by components all over the
 * tree — header, protected route wrapper, checkout, profile page — and
 * changes relatively rarely. Context API works but re-renders every
 * consumer on any state change and needs a Provider wrapper. Zustand
 * gives the same global-store ergonomics without the provider boilerplate
 * and without extra re-renders for components that only read a slice of
 * state (e.g. `useAuthStore((s) => s.user)`).
 *
 * WHY PERSIST TO localStorage:
 * Without this, refreshing the page would log the user out (React state
 * lives only in memory). Tokens are the one thing that's genuinely fine
 * to keep in localStorage for a learning project — production apps
 * handling real payment data often move the refresh token to an
 * httpOnly cookie instead, which JS can't read (mitigates XSS token
 * theft). That's a Phase 2+ hardening step, called out here so the
 * tradeoff isn't silently glossed over.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TokenPair, User } from "@/types/user";

interface AuthState {
  user: User | null;
  tokens: TokenPair | null;
  setAuth: (user: User, tokens: TokenPair) => void;
  setTokens: (tokens: TokenPair) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => set({ user, tokens }),
      setTokens: (tokens) => set({ tokens }),
      logout: () => set({ user: null, tokens: null }),
    }),
    { name: "auth-storage" }
  )
);
