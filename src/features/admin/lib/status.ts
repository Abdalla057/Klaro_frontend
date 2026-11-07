import type {
  AbonnementStatut,
  MoyenPaiement,
  PaiementStatut,
  PaiementTypeOperation,
} from "../../../types/superAdmin";

type Tone = "success" | "warning" | "danger" | "neutral" | "brand";

export const ABONNEMENT_STATUS: Record<
  AbonnementStatut,
  { label: string; tone: Tone }
> = {
  ACTIF: { label: "Actif", tone: "success" },
  EXPIRE: { label: "Expiré", tone: "warning" },
  SUSPENDU: { label: "Suspendu", tone: "danger" },
  ANNULE: { label: "Annulé", tone: "neutral" },
};

export const PAIEMENT_STATUS: Record<
  PaiementStatut,
  { label: string; tone: Tone }
> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  CONFIRME: { label: "Confirmé", tone: "success" },
  REFUSE: { label: "Refusé", tone: "danger" },
  ANNULE: { label: "Annulé", tone: "neutral" },
};

export const TYPE_OPERATION: Record<PaiementTypeOperation, string> = {
  SOUSCRIPTION: "Souscription",
  RENOUVELLEMENT: "Renouvellement",
  REGULARISATION: "Régularisation",
};

export const MOYEN_PAIEMENT: Record<MoyenPaiement, string> = {
  MOBILE_MONEY: "Mobile money",
  VIREMENT: "Virement",
  ESPECES: "Espèces",
  CARTE: "Carte bancaire",
  AUTRE: "Autre",
};

export const MOYENS_PAIEMENT: { value: MoyenPaiement | ""; label: string }[] = [
  { value: "", label: "Non précisé" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "VIREMENT", label: "Virement" },
  { value: "ESPECES", label: "Espèces" },
  { value: "CARTE", label: "Carte bancaire" },
  { value: "AUTRE", label: "Autre" },
];

export function abonnementStatus(statut: AbonnementStatut) {
  return ABONNEMENT_STATUS[statut] ?? { label: statut, tone: "neutral" as Tone };
}

export function paiementStatus(statut: PaiementStatut) {
  return PAIEMENT_STATUS[statut] ?? { label: statut, tone: "neutral" as Tone };
}
