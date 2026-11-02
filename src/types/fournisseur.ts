export interface Fournisseur {
  id: number;
  utilisateur: number;
  nom_entreprise: string;
  code_entreprise: string;
  adresse: string;
  telephone: string;
  est_suspendu: boolean;
  date_suspension: string | null;
  motif_suspension: string;
  date_creation: string;
}

export interface FournisseurUpdate {
  nom_entreprise?: string;
  adresse?: string;
}

export interface Client {
  id: number;
  utilisateur: number;
  fournisseur: number;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  solde_du: string;
  solde_disponible: string;
  montant_credit_initial: string | null;
  compte_active: boolean;
  code_activation: string | null;
  date_creation: string;
  date_activation: string | null;
}

export interface ClientCreate {
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  solde_initial?: string;
}

export interface RegularisationRequest {
  client: number;
  montant: string;
  sens: TransactionSens;
  motif: string;
  cle_idempotence?: string;
}

export interface ClientUpdate {
  nom?: string;
  prenom?: string;
  adresse?: string;
}

export interface Agent {
  id: number;
  utilisateur: number;
  fournisseur: number;
  nom: string;
  prenom: string;
  telephone: string;
  zone: string;
  compte_active: boolean;
  code_activation: string | null;
  date_creation: string;
  date_activation: string | null;
}

export interface AgentCreate {
  nom?: string;
  prenom?: string;
  telephone: string;
  zone?: string;
}

export interface AgentUpdate {
  nom?: string;
  prenom?: string;
  zone?: string;
}

export interface CodeActivationResponse {
  detail: string;
  code_activation: string | null;
}

export interface SoldeClient {
  client: number;
  nom_complet: string;
  telephone: string;
  solde_du: string;
  montant_en_cours: string;
  solde_disponible: string;
}

export type TransactionType =
  | "ATTRIBUTION_INITIALE"
  | "ENCAISSEMENT"
  | "DECAISSEMENT"
  | "REGULARISATION";

export type TransactionSens = "CREDIT" | "DEBIT";
export type TransactionStatut = "VALIDEE" | "ANNULEE";

export interface TransactionFinanciere {
  id: number;
  reference: string;
  fournisseur: number;
  client: number;
  client_nom: string;
  client_telephone: string;
  agent: number | null;
  agent_nom: string | null;
  encaissement: number | null;
  decaissement: number | null;
  type_transaction: TransactionType;
  type_transaction_display: string;
  sens: TransactionSens;
  sens_display: string;
  montant: string;
  statut: TransactionStatut;
  statut_display: string;
  commentaire: string;
  date_creation: string;
  date_validation: string | null;
}

export type DecaissementStatut =
  | "EN_ATTENTE"
  | "CONFIRMATION_AGENT"
  | "EN_ATTENTE_VALIDATION"
  | "APPROUVE"
  | "REFUSE"
  | "PAYE"
  | "ANNULE";

export interface DemandeDecaissementCreate {
  montant: string;
  commentaire?: string;
  cle_idempotence?: string;
}

export interface DemandeDecaissement {
  id: number;
  reference: string;
  fournisseur: number;
  client: number;
  client_nom: string;
  client_telephone: string;
  agent: number | null;
  agent_nom: string | null;
  montant: string;
  statut: DecaissementStatut;
  statut_display: string;
  commentaire: string;
  motif_refus: string;
  date_creation: string;
  date_confirmation_agent: string | null;
  date_decision: string | null;
  date_paiement: string | null;
}

export interface StatistiquesFournisseur {
  nombre_clients: number;
  nombre_clients_actifs: number;
  nombre_agents: number;
  nombre_agents_actifs: number;
  nombre_encaissements: number;
  montant_encaisse: string;
  solde_total_clients: string;
  total_credits: string;
  total_debits: string;
  solde_net: string;
  decaissements_en_cours: number;
  montant_decaissements_en_cours: string;
}

export interface StatistiquesFinancieres {
  total_credits: string;
  total_debits: string;
  solde_net: string;
  nombre_transactions: number;
  decaissements_en_cours: number;
  montant_decaissements_en_cours: string;
  decaissements_payes: number;
}

export interface StatistiquesAgent {
  agent: number;
  nom_complet: string;
  nombre_clients: number;
  nombre_recouvrements: number;
  montant_collecte: string;
}

export interface AttributionSoldeRequest {
  montant: string;
  commentaire?: string;
  cle_idempotence?: string;
}

export type EncaissementStatut = "EN_ATTENTE" | "CONFIRME" | "ANNULE";

export interface Encaissement {
  id: number;
  client: number;
  agent: number | null;
  montant: string;
  statut: EncaissementStatut;
  code_confirmation: string;
  date_creation: string;
  date_confirmation: string | null;
  commentaire: string;
}

export interface PlanAbonnement {
  id: number;
  code: string;
  nom: string;
  description?: string;
  prix?: string;
  devise?: string;
  duree_jours?: number;
  max_clients?: number | null;
  max_agents?: number | null;
  est_essai?: boolean;
  actif?: boolean;
  date_creation: string;
  date_modification: string;
}

export interface AbonnementResume {
  id: number;
  plan_nom: string;
  statut: string;
  statut_effectif: string;
  est_actif: boolean;
  est_essai?: boolean;
  date_debut: string;
  date_fin: string;
  jours_restants: number;
  montant?: string;
  devise?: string;
}

export interface QuotasAbonnement {
  clients: number | null;
  agents: number | null;
}

export interface UtilisationAbonnement {
  clients: number;
  agents: number;
}

export interface FournisseurAbonnement {
  abonnement: AbonnementResume | null;
  plan: PlanAbonnement | null;
  statut: string | null;
  date_debut: string | null;
  date_fin: string | null;
  jours_restants: number;
  est_actif: boolean;
  quotas: QuotasAbonnement;
  utilisation: UtilisationAbonnement;
  peut_creer_client: boolean;
  peut_creer_agent: boolean;
}

export interface ChangementMotDePasseRequest {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
  confirmation: string;
}

export interface DetailResponse {
  detail: string;
}
