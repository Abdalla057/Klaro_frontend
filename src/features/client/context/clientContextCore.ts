import { createContext, useContext } from "react";
import type { Client, SoldeClient } from "../../../types/fournisseur";

export interface ClientContextValue {
  profil: Client | null;
  solde: SoldeClient | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within ClientProvider");
  }
  return context;
}
