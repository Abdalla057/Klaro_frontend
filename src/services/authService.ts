import axios from "axios";
import api, { API_URL } from "./api";
import { storage } from "../utils/storage";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Utilisateur,
} from "../types/auth";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/comptes/login/", data);
  if (res.data.access) storage.setAccessToken(res.data.access);
  if (res.data.refresh) storage.setRefreshToken(res.data.refresh);
  if (res.data.utilisateur) storage.setUser(res.data.utilisateur);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/api/fournisseurs/", data);
  return res.data;
}

export async function me(): Promise<Utilisateur> {
  const res = await api.get<Utilisateur>("/api/comptes/me/");
  storage.setUser(res.data);
  return res.data;
}

export async function logout(): Promise<void> {
  const refreshToken = storage.getRefreshToken();
  const accessToken = storage.getAccessToken();
  storage.clearTokens();

  if (!refreshToken) return;

  try {
    await axios.post(
      `${API_URL}/api/comptes/logout/`,
      { refresh: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        timeout: 5000,
      },
    );
  } catch {
    // La session locale est déjà supprimée, l'invalidation serveur est best-effort.
  }
}

export async function refresh(): Promise<{ access: string }> {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) throw new Error("Session expirée");

  const res = await api.post<{ access: string }>("/api/comptes/refresh/", { refresh: refreshToken });
  if (res.data.access) storage.setAccessToken(res.data.access);
  return res.data;
}
