import type { DemandeDecaissement, TransactionFinanciere } from "../../types/fournisseur";

export interface ClientDashboardStats {
  totalDemandes: number;
  enAttente: number;
  confirmeesAgent: number;
  enValidation: number;
  approuvees: number;
  payees: number;
  refusees: number;
  annulees: number;
  montantEnCours: number;
  montantPaye: number;
}

export interface ClientActivityItem {
  id: string;
  transaction: TransactionFinanciere;
}

export interface ClientDemandeSummary {
  demande: DemandeDecaissement;
  resteEstime: number;
}
