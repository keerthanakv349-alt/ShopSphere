// Mirrors app/schemas/user.py on the backend. Keeping these in sync by hand
// is fine at this scale — Phase 2+ can generate this file automatically
// from the FastAPI OpenAPI schema (openapi-typescript) once the API surface
// grows past a handful of endpoints.

export type UserRole = "customer" | "admin" | "super_admin";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
