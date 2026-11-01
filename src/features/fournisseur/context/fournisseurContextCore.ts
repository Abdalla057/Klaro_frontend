import { createContext, useContext } from "react";
import type { Fournisseur, FournisseurAbonnement } from "../../../types/fournisseur";

export interface FournisseurContextValue {
  profil: Fournisseur | null;
  abonnement: FournisseurAbonnement | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const FournisseurContext = createContext<FournisseurContextValue | undefined>(undefined);

export function useFournisseur() {
  const context = useContext(FournisseurContext);
  if (!context) {
    throw new Error("useFournisseur must be used within FournisseurProvider");
  }
  return context;
}
