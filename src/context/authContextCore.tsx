import { createContext, useContext } from "react";
import type { Utilisateur } from "../types/auth";

/**
 * Contrat du contexte d'authentification.
 *
 * `user` reflète l'utilisateur courant (persisté par l'API), `logoutLocal`
 * nettoie uniquement l'état client après l'appel de déconnexion serveur.
 */
interface AuthContextType {
  user: Utilisateur | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: Utilisateur | null) => void;
  logoutLocal: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
