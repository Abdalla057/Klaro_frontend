export type UserRole = "agent" | "client" | "fournisseur" | "super_admin";

export interface Utilisateur {
  id: number;
  telephone: string;
  role: UserRole;
  role_display?: string;
  date_joined?: string;
  [key: string]: unknown;
}

export interface LoginRequest {
  telephone: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  utilisateur: Utilisateur;
}

export interface RegisterRequest {
  telephone: string;
  password: string;
  nom_entreprise: string;
  adresse: string;
}

export interface RegisterResponse {
  id: number;
  telephone: string;
  nom_entreprise: string;
  adresse?: string;
  code_entreprise?: string;
  date_creation?: string;
}

export interface ActivationRequest {
  telephone: string;
  code: string;
  password: string;
}

export interface ActivationResponse {
  detail: string;
  telephone: string;
  role: UserRole;
}

export interface VerificationCodeRequest {
  telephone: string;
  code: string;
}

export interface VerificationCodeResponse {
  telephone: string;
  role: UserRole;
  token: string;
  expire_dans_minutes: number;
}

export interface DefinitionMotDePasseRequest {
  telephone: string;
  token: string;
  password: string;
  confirmation: string;
}

export interface DefinitionMotDePasseResponse {
  detail: string;
  telephone: string;
  role: UserRole;
}

export interface StatutActivation {
  telephone: string;
  role: UserRole;
  compte_active: boolean;
  date_creation: string;
  date_activation: string | null;
  code_expiration: string | null;
  tentatives_restantes: number;
}
