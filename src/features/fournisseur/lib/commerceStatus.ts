import type {
  CanalNotification,
  ModePaiement,
  StatutCommande,
  StatutDette,
  StatutNotificationExterne,
  StatutVente,
  TypeMouvementStock,
  TypeNotificationClient,
} from "../../../types/commerce";

export type CommerceTone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

export const COMMANDE_STATUS: Record<StatutCommande, { label: string; tone: CommerceTone }> = {
  BROUILLON: { label: "Brouillon", tone: "neutral" },
  COMMANDEE: { label: "Commandée", tone: "brand" },
  PARTIELLEMENT_RECUE: { label: "Partiellement reçue", tone: "warning" },
  RECUE: { label: "Reçue", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
};

export const VENTE_STATUS: Record<StatutVente, { label: string; tone: CommerceTone }> = {
  VALIDEE: { label: "Validée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "danger" },
};

export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  ESPECES: "Espèces",
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  VIREMENT: "Virement",
  CREDIT: "Crédit",
};

export const MODES_PAIEMENT: { value: ModePaiement; label: string }[] = [
  { value: "ESPECES", label: "Espèces" },
  { value: "WAVE", label: "Wave" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CREDIT", label: "Crédit" },
];

export const DETTE_STATUS: Record<StatutDette, { label: string; tone: CommerceTone }> = {
  OUVERTE: { label: "Ouverte", tone: "danger" },
  PARTIELLE: { label: "Partiellement soldée", tone: "warning" },
  SOLDEE: { label: "Soldée", tone: "success" },
  ANNULEE: { label: "Annulée", tone: "neutral" },
};

export const MOUVEMENT_TYPE: Record<TypeMouvementStock, { label: string; tone: CommerceTone }> = {
  ENTREE: { label: "Entrée", tone: "success" },
  SORTIE: { label: "Sortie", tone: "danger" },
  AJUSTEMENT: { label: "Ajustement", tone: "warning" },
};

export const NOTIFICATION_CLIENT_TYPE: Record<
  TypeNotificationClient,
  { label: string; tone: CommerceTone }
> = {
  NOUVELLE_VENTE: { label: "Nouvelle vente", tone: "brand" },
  NOUVELLE_FACTURE: { label: "Nouvelle facture", tone: "info" },
  PAIEMENT_RECU: { label: "Paiement reçu", tone: "success" },
  RAPPEL_DETTE: { label: "Rappel de dette", tone: "warning" },
  VENTE_ANNULEE: { label: "Vente annulée", tone: "danger" },
};

export const NOTIFICATION_EXTERNE_STATUS: Record<
  StatutNotificationExterne,
  { label: string; tone: CommerceTone }
> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  ENVOYE: { label: "Envoyé", tone: "success" },
  ECHOUE: { label: "Échoué", tone: "danger" },
};

export const CANAL_LABELS: Record<CanalNotification, string> = {
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
};

export function stockStatus(produit: {
  stock_actuel: string;
  seuil_alerte: string;
}): { label: string; tone: CommerceTone } {
  const stock = Number(produit.stock_actuel);
  const seuil = Number(produit.seuil_alerte);

  if (stock <= 0) return { label: "Rupture", tone: "danger" };
  if (stock <= seuil) return { label: "Stock faible", tone: "warning" };
  return { label: "En stock", tone: "success" };
}
