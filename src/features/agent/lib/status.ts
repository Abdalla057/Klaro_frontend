import type {
  DecaissementStatut,
  EncaissementStatut,
  TransactionStatut,
} from "../../../types/fournisseur";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "brand";

export const ENCAISSEMENT_AGENT_STATUS: Record<
  EncaissementStatut,
  { label: string; tone: StatusTone }
> = {
  EN_ATTENTE: { label: "À confirmer", tone: "warning" },
  CONFIRME: { label: "Confirmé", tone: "success" },
  ANNULE: { label: "Annulé", tone: "danger" },
};

export const DECAISSEMENT_AGENT_STATUS: Record<
  DecaissementStatut,
  { label: string; tone: StatusTone }
> = {
  EN_ATTENTE: { label: "À confirmer", tone: "warning" },
  CONFIRMATION_AGENT: { label: "Confirmé par agent", tone: "brand" },
  EN_ATTENTE_VALIDATION: { label: "En validation", tone: "warning" },
  APPROUVE: { label: "Approuvé", tone: "brand" },
  REFUSE: { label: "Refusé", tone: "danger" },
  PAYE: { label: "Payé", tone: "success" },
  ANNULE: { label: "Annulé", tone: "neutral" },
};

export const TRANSACTION_AGENT_STATUS: Record<
  TransactionStatut,
  { label: string; tone: StatusTone }
> = {
  VALIDEE: { label: "Validée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
};

export function agentStatus(active: boolean): { label: string; tone: StatusTone } {
  return active
    ? { label: "Actif", tone: "success" }
    : { label: "En attente d'activation", tone: "warning" };
}
