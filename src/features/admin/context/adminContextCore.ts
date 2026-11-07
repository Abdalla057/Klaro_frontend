import { createContext, useContext } from "react";
import type {
  AbonnementAdmin,
  FournisseurSupervision,
  PaiementAbonnement,
  PlanAbonnement,
  StatistiquesFinancieres,
  TableauDeBord,
} from "../../../types/superAdmin";

export interface AdminDataValue {
  tableau: TableauDeBord | null;
  finances: StatistiquesFinancieres | null;
  fournisseurs: FournisseurSupervision[];
  abonnements: AbonnementAdmin[];
  paiements: PaiementAbonnement[];
  plans: PlanAbonnement[];
  /** Vrai tant que le premier chargement n'est pas terminé. */
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  /** Incrémenté à chaque synchronisation réussie (sert à recharger les séries). */
  version: number;
  refresh: (silencieux?: boolean) => Promise<void>;
}

export const AdminDataContext = createContext<AdminDataValue | undefined>(undefined);

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within AdminProvider");
  }
  return context;
}
