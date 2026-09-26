import { api } from "@/lib/api";
import type { ApiResponse, AuthUser, LoginResponse } from "@/types";

const TOKEN_KEY = "eventflow_access_token";
const USER_KEY = "eventflow_user";

export function saveSession(payload: LoginResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, payload.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
}

export function getLocalUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logoutLocal() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
    email,
    password,
  });
  if (data.data?.accessToken) saveSession(data.data);
  return data;
}

export async function registerAttendee(payload: {
  name: string;
  email: string;
  password: string;
  attendee?: { phone?: string; location?: string };
}) {
  const { data } = await api.post<ApiResponse<null>>("/auth/register", payload);
  return data;
}

export async function verifyEmail(email: string, otp: string) {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/auth/verify-email",
    { email, otp },
  );
  if (data.data?.accessToken) saveSession(data.data);
  return data;
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<AuthUser>>("/auth/me");
  if (data.data && typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(data.data));
  }
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    logoutLocal();
  }
}
