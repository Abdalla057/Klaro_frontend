import type {
  DecaissementStatut,
  EncaissementStatut,
  TransactionType,
} from "../../../types/fournisseur";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "brand";

export const ENCAISSEMENT_STATUS: Record<EncaissementStatut, { label: string; tone: StatusTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  CONFIRME: { label: "Confirmé", tone: "success" },
  ANNULE: { label: "Annulé", tone: "danger" },
};

export const DECAISSEMENT_STATUS: Record<
  DecaissementStatut,
  { label: string; tone: StatusTone }
> = {
  EN_ATTENTE: { label: "En attente de l'agent", tone: "warning" },
  CONFIRMATION_AGENT: { label: "À approuver", tone: "warning" },
  EN_ATTENTE_VALIDATION: { label: "À approuver", tone: "warning" },
  APPROUVE: { label: "À payer", tone: "brand" },
  REFUSE: { label: "Refusé", tone: "danger" },
  PAYE: { label: "Payé", tone: "success" },
  ANNULE: { label: "Annulé", tone: "neutral" },
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  ATTRIBUTION_INITIALE: "Solde initial",
  ENCAISSEMENT: "Encaissement",
  DECAISSEMENT: "Décaissement",
  REGULARISATION: "Régularisation",
};

export function compteStatus(active: boolean): { label: string; tone: StatusTone } {
  return active
    ? { label: "Activé", tone: "success" }
    : { label: "En attente d'activation", tone: "warning" };
}

export function abonnementStatusLabel(statut: string | null | undefined, estActif: boolean): string {
  if (estActif) return "Actif";
  if (!statut) return "Aucun abonnement";

  const labels: Record<string, string> = {
    ACTIF: "Actif",
    EXPIRE: "Expiré",
    SUSPENDU: "Suspendu",
    ANNULE: "Annulé",
  };

  return labels[statut] ?? statut;
}

export function abonnementStatusTone(
  statut: string | null | undefined,
  estActif: boolean,
): StatusTone {
  if (estActif) return "success";
  if (!statut) return "neutral";
  if (statut === "SUSPENDU") return "warning";
  if (statut === "EXPIRE" || statut === "ANNULE") return "danger";
  return "neutral";
}
