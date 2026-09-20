import { api } from "@/lib/api";
import type { ApiResponse, AuthUser, LoginResponse } from "@/types";

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", { email, password });
  if (typeof window !== "undefined" && data.data?.accessToken) {
    localStorage.setItem("eventflow_access_token", data.data.accessToken);
    localStorage.setItem("eventflow_user", JSON.stringify(data.data.user));
  }
  return data;
}

export async function registerAttendee(payload: { name: string; email: string; password: string; attendee?: { phone?: string; location?: string } }) {
  const { data } = await api.post<ApiResponse<null>>("/auth/register", payload);
  return data;
}

export async function verifyEmail(email: string, otp: string) {
  const { data } = await api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: AuthUser }>>("/auth/verify-email", { email, otp });
  if (typeof window !== "undefined" && data.data?.accessToken) {
    localStorage.setItem("eventflow_access_token", data.data.accessToken);
    localStorage.setItem("eventflow_user", JSON.stringify(data.data.user));
  }
  return data;
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<AuthUser>>("/auth/me");
  return data;
}

export function logoutLocal() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("eventflow_access_token");
    localStorage.removeItem("eventflow_user");
  }
}

export function getLocalUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("eventflow_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}
