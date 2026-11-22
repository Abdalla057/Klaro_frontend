import type {
  FournisseurResume,
  MoyenPaiement,
  PaiementAbonnement,
  UtilisateurResume,
} from "./superAdmin";

export type DemandeStatut =
  | "EN_ATTENTE"
  | "EN_VERIFICATION"
  | "CONFIRMEE"
  | "REFUSEE"
  | "ANNULEE"
  | "EXPIREE"
  | "ECHEC";

export type DemandeTypeOperation = "SOUSCRIPTION" | "RENOUVELLEMENT";

export interface PrestatairePaiement {
  code: string;
  nom: string;
  moyen_paiement: string;
}

export interface PrestatairesPaiementDisponibles {
  pays: string;
  actif: boolean;
  prestataires: PrestatairePaiement[];
}

export interface DemandeAbonnement {
  id: string;
  reference: string;
  fournisseur: FournisseurResume;
  plan: number;
  plan_nom: string;
  type_operation: DemandeTypeOperation;
  type_operation_display: string;
  abonnement_cible: number | null;
  abonnement_genere: number | null;
  pays: string;
  montant: string;
  montant_reference: string;
  devise: string;
  taux_conversion: string;
  moyen_paiement: MoyenPaiement | "";
  moyen_paiement_display: string;
  prestataire: string;
  reference_transaction: string;
  preuve_paiement: string | null;
  statut: DemandeStatut;
  statut_display: string;
  est_annulable: boolean;
  commentaire_fournisseur: string;
  motif_traitement: string;
  traite_par: UtilisateurResume | null;
  date_traitement: string | null;
  date_expiration: string | null;
  date_creation: string;
  date_modification: string;
  paiement?: PaiementAbonnement | null;
  nouvelle_confirmation?: boolean;
  paiement_url?: string;
  rejoue?: boolean;
}

export interface DemandeAbonnementCreationPayload {
  plan: number;
  type_operation: DemandeTypeOperation;
  abonnement_cible?: number | null;
  moyen_paiement?: MoyenPaiement | "";
  prestataire?: string;
  reference_transaction?: string;
  preuve_paiement?: File | null;
  cle_idempotence: string;
  commentaire_fournisseur?: string;
}

export interface SoumissionPaiementPayload {
  reference_transaction?: string;
  preuve_paiement?: File | null;
  moyen_paiement?: MoyenPaiement | "";
  prestataire?: string;
  commentaire?: string;
}

export interface ConfirmationDemandePayload {
  reference_transaction?: string;
  prestataire?: string;
  provider_transaction_id?: string;
  moyen_paiement?: MoyenPaiement | "";
  motif?: string;
}

export interface EvenementDemande {
  id: number;
  type_evenement: string;
  type_evenement_display: string;
  ancien_statut: string;
  nouveau_statut: string;
  montant: string | null;
  reference_paiement: string;
  motif: string;
  effectue_par: UtilisateurResume | null;
  date_creation: string;
}
