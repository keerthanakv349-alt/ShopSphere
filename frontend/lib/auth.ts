// import { api } from "@/lib/api";
// import type { AuthResponse, LoginPayload, SignupPayload, User } from "@/types/user";

// export async function signup(payload: SignupPayload): Promise<AuthResponse> {
//   const { data } = await api.post<AuthResponse>("/api/v1/auth/signup", payload);
//   return data;
// }

// export async function login(payload: LoginPayload): Promise<AuthResponse> {
//   const { data } = await api.post<AuthResponse>("/api/v1/auth/login", payload);
//   return data;
// }

// export async function fetchMe(): Promise<User> {
//   const { data } = await api.get<User>("/api/v1/auth/me");
//   return data;
// }

// export async function logoutRequest(): Promise<void> {
//   await api.post("/api/v1/auth/logout");
// }



import { api } from "@/lib/api";
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
} from "@/types/user";

export async function signup(
  payload: SignupPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/api/v1/auth/signup",
    payload
  );

  return data;
}

export async function login(
  payload: LoginPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    "/api/v1/auth/login",
    payload
  );

  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/api/v1/auth/me");

  return data;
}

export async function updateMe(payload: {
  full_name: string;
  phone_number: string | null;
}): Promise<User> {
  const { data } = await api.put<User>(
    "/api/v1/auth/me",
    payload
  );

  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/api/v1/auth/logout");
}