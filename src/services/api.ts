import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { storage } from "../utils/storage";

export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const method = config.method?.toLowerCase();
  const isPublicAuth =
    url.includes("/api/comptes/login/") ||
    url.includes("/api/comptes/refresh/") ||
    (method === "post" && url.includes("/api/fournisseurs/"));

  const token = storage.getAccessToken();
  if (token && !isPublicAuth) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) throw new Error("Session expirée");

  const response = await axios.post<{ access: string }>(
    `${API_URL}/api/comptes/refresh/`,
    { refresh: refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 20000 },
  );

  if (!response.data.access) throw new Error("Réponse de renouvellement invalide");
  storage.setAccessToken(response.data.access);
  return response.data.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isRefreshCall = originalRequest?.url?.includes("/api/comptes/refresh/") ?? false;
    const isLoginCall = originalRequest?.url?.includes("/api/comptes/login/") ?? false;
    const isRegisterCall =
      originalRequest?.method?.toLowerCase() === "post" &&
      (originalRequest?.url?.includes("/api/fournisseurs/") ?? false);

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshCall ||
      isLoginCall ||
      isRegisterCall
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const access = await refreshPromise;
      originalRequest.headers.set("Authorization", `Bearer ${access}`);
      return api(originalRequest);
    } catch (refreshError) {
      storage.clearTokens();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
        window.location.replace("/auth/login");
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
