export type PeriodeStatistique = "hebdomadaire" | "mensuelle" | "annuelle";

export interface EvolutionFinanciere {
  semaine: string | null;
  mois: string | null;
  annee: string | null;
}

export interface StatistiquesFinancieresDevise {
  devise: string;
  chiffre_affaires_total: string;
  chiffre_affaires_semaine: string;
  chiffre_affaires_mois: string;
  chiffre_affaires_annee: string;
  nombre_paiements_confirmes: number;
  montant_moyen_paiement: string;
  evolution: EvolutionFinanciere;
}

export interface StatistiquesFinancieres extends StatistiquesFinancieresDevise {
  multi_devise: boolean;
  devises: StatistiquesFinancieresDevise[];
}

export interface PointSerieChiffreAffaires {
  date: string;
  montant: string;
  nombre_paiements: number;
}

export interface SerieChiffreAffairesDevise {
  devise: string;
  total: string;
  nombre_paiements: number;
  points: PointSerieChiffreAffaires[];
}

export interface SerieChiffreAffaires {
  periode: string;
  granularite: string;
  date_debut: string;
  date_fin: string;
  devises: SerieChiffreAffairesDevise[];
}

export interface StatutsAbonnements {
  total: number;
  actifs: number;
  expires: number;
  suspendus: number;
  annules: number;
  essais_actifs: number;
}

export interface PeriodeAbonnements {
  nouvelles_souscriptions: number;
  renouvellements: number;
}

export interface PointEvolutionAbonnements {
  date: string;
  nouvelles_souscriptions: number;
  renouvellements: number;
  total_abonnements: number;
}

export interface StatistiquesAbonnements {
  periode: string;
  granularite: string;
  date_debut: string;
  date_fin: string;
  statuts: StatutsAbonnements;
  periode_courante: PeriodeAbonnements;
  points: PointEvolutionAbonnements[];
}

export interface StatistiquesFournisseursGlobales {
  total: number;
  actifs: number;
  suspendus: number;
}

export interface StatistiquesClientsGlobales {
  total: number;
  actifs: number;
}

export interface StatistiquesAgentsGlobales {
  total: number;
  actifs: number;
}

export interface StatistiquesEncaissementsGlobales {
  total: number;
  en_attente: number;
  confirmes: number;
  annules: number;
  montant_confirme: string;
  montant_en_attente: string;
}

export interface TableauDeBord {
  fournisseurs: StatistiquesFournisseursGlobales;
  clients: StatistiquesClientsGlobales;
  agents: StatistiquesAgentsGlobales;
  encaissements: StatistiquesEncaissementsGlobales;
  abonnements: StatutsAbonnements;
  montant_facture_total: string;
  finances: StatistiquesFinancieres;
}

export type AbonnementStatut = "ACTIF" | "EXPIRE" | "SUSPENDU" | "ANNULE";
export type PaiementStatut = "EN_ATTENTE" | "CONFIRME" | "REFUSE" | "ANNULE";
export type PaiementTypeOperation = "SOUSCRIPTION" | "RENOUVELLEMENT" | "REGULARISATION";
export type MoyenPaiement = "MOBILE_MONEY" | "VIREMENT" | "ESPECES" | "CARTE" | "AUTRE";

export interface UtilisateurResume {
  id: number;
  telephone: string;
  role?: string;
  is_active?: boolean;
}

export interface FournisseurResume {
  id: number;
  nom_entreprise: string;
  code_entreprise: string;
  telephone: string;
}

export interface PlanAbonnement {
  id: number;
  code: string;
  nom: string;
  description: string;
  prix: string;
  devise: string;
  duree_jours: number;
  max_clients: number | null;
  max_agents: number | null;
  est_essai: boolean;
  actif: boolean;
  date_creation: string;
  date_modification: string;
}

export interface AbonnementResume {
  id: number;
  plan_nom: string;
  statut: AbonnementStatut;
  statut_effectif: string;
  est_actif: boolean;
  est_essai: boolean;
  date_debut: string;
  date_fin: string;
  jours_restants: number;
  montant: string;
  devise: string;
}

export interface AbonnementAdmin {
  id: number;
  fournisseur: FournisseurResume;
  plan: PlanAbonnement;
  date_debut: string;
  date_fin: string;
  statut: AbonnementStatut;
  statut_effectif: string;
  est_actif: boolean;
  est_essai: boolean;
  jours_restants: number;
  montant: string;
  devise: string;
  reference_paiement: string;
  notes: string;
  cree_par: UtilisateurResume | null;
  date_creation: string;
  date_modification: string;
}

export interface FournisseurSupervision {
  id: number;
  nom_entreprise: string;
  code_entreprise: string;
  telephone: string;
  adresse: string;
  date_creation: string;
  statut: "ACTIF" | "SUSPENDU";
  est_suspendu: boolean;
  date_suspension: string | null;
  motif_suspension: string;
  suspendu_par: UtilisateurResume | null;
  utilisateur: UtilisateurResume;
  nombre_clients: number;
  nombre_agents: number;
  abonnement: AbonnementResume | null;
}

export interface PaiementAbonnement {
  id: number;
  reference: string;
  fournisseur: FournisseurResume;
  abonnement: number;
  plan: number;
  plan_nom: string;
  montant: string;
  devise: string;
  statut: PaiementStatut;
  statut_display: string;
  type_operation: PaiementTypeOperation;
  type_operation_display: string;
  moyen_paiement: MoyenPaiement | "";
  moyen_paiement_display: string;
  reference_transaction: string;
  cle_idempotence: string;
  commentaire: string;
  confirme_par: UtilisateurResume | null;
  date_creation: string;
  date_confirmation: string | null;
  date_modification: string;
}

export interface AbonnementCreationPayload {
  fournisseur: number;
  plan: number;
  date_debut?: string;
  montant_paiement?: string;
  moyen_paiement?: MoyenPaiement | "";
  paiement_confirme?: boolean;
  reference_paiement?: string;
  notes?: string;
  cle_idempotence?: string;
}

export interface RenouvellementPayload {
  plan?: number | null;
  montant_paiement?: string;
  moyen_paiement?: MoyenPaiement | "";
  paiement_confirme?: boolean;
  reference_paiement?: string;
  notes?: string;
  cle_idempotence?: string;
}

export interface PaiementCreationPayload {
  abonnement: number;
  montant?: string;
  devise?: string;
  type_operation?: PaiementTypeOperation;
  moyen_paiement?: MoyenPaiement | "";
  reference_transaction?: string;
  cle_idempotence?: string;
  commentaire?: string;
  confirmer?: boolean;
}
