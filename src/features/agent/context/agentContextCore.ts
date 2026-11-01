import { createContext, useContext } from "react";
import type { Agent } from "../../../types/fournisseur";

export interface AgentContextValue {
  profil: Agent | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within AgentProvider");
  }
  return context;
}
