import type { DemandeStatut, DemandeTypeOperation } from "../../types/demandesAbonnement";
import type { MoyenPaiement } from "../../types/superAdmin";

export type DemandeTone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

export const DEMANDE_STATUS: Record<DemandeStatut, { label: string; tone: DemandeTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  EN_VERIFICATION: { label: "En vérification", tone: "info" },
  CONFIRMEE: { label: "Confirmée", tone: "success" },
  REFUSEE: { label: "Refusée", tone: "danger" },
  ANNULEE: { label: "Annulée", tone: "neutral" },
  EXPIREE: { label: "Expirée", tone: "neutral" },
  ECHEC: { label: "Échec", tone: "danger" },
};

export const DEMANDE_STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(DEMANDE_STATUS).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

export const DEMANDE_TYPE_LABELS: Record<DemandeTypeOperation, string> = {
  SOUSCRIPTION: "Souscription",
  RENOUVELLEMENT: "Renouvellement",
};

export const MOYEN_PAIEMENT_LABELS: Record<MoyenPaiement, string> = {
  MOBILE_MONEY: "Mobile money",
  VIREMENT: "Virement",
  ESPECES: "Espèces",
  CARTE: "Carte bancaire",
  AUTRE: "Autre",
};

export const MOYENS_PAIEMENT_MANUELS: { value: MoyenPaiement; label: string }[] = [
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "VIREMENT", label: "Virement" },
  { value: "ESPECES", label: "Espèces" },
  { value: "CARTE", label: "Carte bancaire" },
  { value: "AUTRE", label: "Autre" },
];

export function demandeStatus(statut: DemandeStatut) {
  return DEMANDE_STATUS[statut] ?? { label: statut, tone: "neutral" as DemandeTone };
}

export function estDemandeActive(statut: DemandeStatut): boolean {
  return statut === "EN_ATTENTE" || statut === "EN_VERIFICATION";
}

export function libelleMoyenPaiement(
  moyen: MoyenPaiement | "" | null | undefined,
  fallback?: string | null,
): string {
  if (moyen && moyen in MOYEN_PAIEMENT_LABELS) return MOYEN_PAIEMENT_LABELS[moyen];
  return fallback || "Non précisé";
}
