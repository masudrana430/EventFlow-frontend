import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://eventflow-ln9q.onrender.com/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eventflow_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      !String(error?.config?.url || "").includes("/auth/login")
    ) {
      localStorage.removeItem("eventflow_access_token");
      localStorage.removeItem("eventflow_user");
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: any, fallback = "Something went wrong") {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
