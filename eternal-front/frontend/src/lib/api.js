import axios from "axios";
import { endpoints } from "./endpoints";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const isAuthRoute =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/signup") ||
    config.url?.includes("/auth/verify-otp");

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || d).join(", ");
  return err?.message || "Something went wrong";
}

export { api, endpoints };
