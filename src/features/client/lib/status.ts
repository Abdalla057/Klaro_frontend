import type {
  DecaissementStatut,
  TransactionSens,
  TransactionStatut,
  TransactionType,
} from "../../../types/fournisseur";

export type ClientStatusTone = "success" | "warning" | "danger" | "neutral" | "brand";

export const DEMANDE_CLIENT_STATUS: Record<
  DecaissementStatut,
  { label: string; tone: ClientStatusTone; description: string }
> = {
  EN_ATTENTE: {
    label: "En attente",
    tone: "warning",
    description: "Votre demande attend la confirmation d'un agent.",
  },
  CONFIRMATION_AGENT: {
    label: "Confirmée par l'agent",
    tone: "brand",
    description: "Un agent a confirmé votre demande. Elle attend la décision du fournisseur.",
  },
  EN_ATTENTE_VALIDATION: {
    label: "En attente de validation",
    tone: "warning",
    description: "Votre demande est en cours de validation.",
  },
  APPROUVE: {
    label: "Approuvée",
    tone: "brand",
    description: "Votre demande est approuvée et attend son paiement.",
  },
  REFUSE: {
    label: "Refusée",
    tone: "danger",
    description: "Votre demande a été refusée.",
  },
  PAYE: {
    label: "Payée",
    tone: "success",
    description: "Votre demande a été payée.",
  },
  ANNULE: {
    label: "Annulée",
    tone: "neutral",
    description: "Votre demande a été annulée.",
  },
};

export const TRANSACTION_CLIENT_TYPE_LABELS: Record<TransactionType, string> = {
  ATTRIBUTION_INITIALE: "Attribution initiale",
  ENCAISSEMENT: "Encaissement",
  DECAISSEMENT: "Décaissement",
  REGULARISATION: "Régularisation",
};

export const TRANSACTION_CLIENT_SENS_LABELS: Record<TransactionSens, string> = {
  CREDIT: "Crédit",
  DEBIT: "Débit",
};

export const TRANSACTION_CLIENT_STATUS: Record<
  TransactionStatut,
  { label: string; tone: ClientStatusTone }
> = {
  VALIDEE: { label: "Validée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
};

export const STATUTS_ANNULABLES: DecaissementStatut[] = [
  "EN_ATTENTE",
  "CONFIRMATION_AGENT",
  "EN_ATTENTE_VALIDATION",
  "APPROUVE",
];

export function peutAnnulerDemande(statut: DecaissementStatut): boolean {
  return STATUTS_ANNULABLES.includes(statut);
}

export function compteClientStatus(active: boolean): {
  label: string;
  tone: ClientStatusTone;
} {
  return active
    ? { label: "Compte activé", tone: "success" }
    : { label: "Activation en attente", tone: "warning" };
}
