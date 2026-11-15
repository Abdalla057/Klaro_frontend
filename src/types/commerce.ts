export type StatutCommande =
  | "BROUILLON"
  | "COMMANDEE"
  | "PARTIELLEMENT_RECUE"
  | "RECUE"
  | "ANNULEE";

export type TypeMouvementStock = "ENTREE" | "SORTIE" | "AJUSTEMENT";

export type StatutVente = "VALIDEE" | "ANNULEE";

export type ModePaiementReel =
  | "ESPECES"
  | "WAVE"
  | "ORANGE_MONEY"
  | "VIREMENT";

export type ModePaiement = ModePaiementReel | "CREDIT";

export type StatutDette = "OUVERTE" | "PARTIELLE" | "SOLDEE" | "ANNULEE";

export type TypeNotificationClient =
  | "NOUVELLE_VENTE"
  | "NOUVELLE_FACTURE"
  | "PAIEMENT_RECU"
  | "RAPPEL_DETTE"
  | "VENTE_ANNULEE";

export type CanalNotification = "SMS" | "WHATSAPP";

export type StatutNotificationExterne = "EN_ATTENTE" | "ENVOYE" | "ECHOUE";

export interface CategorieProduit {
  id: number;
  nom: string;
  description: string;
  actif: boolean;
  date_creation: string;
}

export interface CategorieProduitPayload {
  nom: string;
  description?: string;
  actif?: boolean;
}

export interface ProduitUnite {
  id: number;
  nom: string;
  symbole: string;
  facteur_conversion: string;
  prix_vente: string | null;
  prix_effectif: string;
  est_base: boolean;
}

export interface ProduitUnitePayload {
  nom: string;
  symbole?: string;
  facteur_conversion: string;
  prix_vente?: string | null;
  est_base?: boolean;
}

export interface Produit {
  id: number;
  categorie: number | null;
  categorie_nom: string | null;
  nom: string;
  reference: string;
  description: string;
  unite_base: string;
  prix_achat: string;
  prix_vente: string;
  seuil_alerte: string;
  stock_actuel: string;
  est_en_rupture: boolean;
  en_alerte: boolean;
  actif: boolean;
  unites: ProduitUnite[];
  date_creation: string;
  date_modification: string;
}

export interface ProduitPayload {
  categorie?: number | null;
  nom: string;
  description?: string;
  unite_base: string;
  prix_achat: string;
  prix_vente: string;
  seuil_alerte?: string;
  actif?: boolean;
  unites_ecriture?: ProduitUnitePayload[];
}

export interface FournisseurMarchandise {
  id: number;
  nom: string;
  telephone: string;
  adresse: string;
  notes: string;
  actif: boolean;
  date_creation: string;
}

export interface FournisseurMarchandisePayload {
  nom: string;
  telephone?: string;
  adresse?: string;
  notes?: string;
  actif?: boolean;
}

export interface LigneCommandeAchat {
  id: number;
  produit: number;
  produit_nom: string;
  unite: number;
  unite_nom: string;
  unite_facteur: string;
  quantite: string;
  quantite_base: string;
  quantite_recue_base: string;
  prix_achat_unitaire: string;
  sous_total: string;
}

export interface CommandeAchat {
  id: number;
  reference: string;
  fournisseur_marchandise: number;
  fournisseur_marchandise_nom: string;
  statut: StatutCommande;
  statut_display: string;
  montant_total: string;
  notes: string;
  lignes: LigneCommandeAchat[];
  date_commande: string;
  date_creation: string;
}

export interface LigneCommandeAchatPayload {
  produit: number;
  unite: number;
  quantite: string;
  prix_achat_unitaire?: string;
}

export interface CommandeAchatPayload {
  fournisseur_marchandise: number;
  lignes: LigneCommandeAchatPayload[];
  notes?: string;
  statut?: StatutCommande;
}

export interface LigneReception {
  id: number;
  ligne_commande: number;
  produit_nom: string;
  unite_nom: string;
  quantite: string;
  quantite_base: string;
}

export interface Reception {
  id: number;
  reference: string;
  commande: number;
  commande_reference: string;
  notes: string;
  lignes: LigneReception[];
  date_reception: string;
}

export interface ReceptionPayload {
  lignes: { ligne_commande: number; quantite: string }[];
  notes?: string;
}

export interface MouvementStock {
  id: number;
  produit: number;
  produit_nom: string;
  type_mouvement: TypeMouvementStock;
  type_display: string;
  quantite_base: string;
  stock_apres: string;
  motif: string;
  vente: number | null;
  vente_reference: string | null;
  reception: number | null;
  reception_reference: string | null;
  date_creation: string;
}

export interface LigneVente {
  id: number;
  produit: number;
  nom_produit: string;
  unite_nom: string;
  quantite: string;
  quantite_base: string;
  prix_unitaire: string;
  sous_total: string;
}

export interface Vente {
  id: number;
  reference: string;
  numero_facture: string | null;
  client: number;
  client_nom: string;
  client_telephone: string;
  statut: StatutVente;
  statut_display: string;
  montant_total: string;
  montant_paye: string;
  reste_a_payer: string;
  mode_paiement: ModePaiement;
  mode_paiement_display: string;
  est_soldee: boolean;
  est_partielle: boolean;
  lignes: LigneVente[];
  facture_id: number | null;
  dette_statut: StatutDette | null;
  nombre_paiements: number;
  date_creation: string;
}

export interface LigneVentePayload {
  produit: number;
  unite: number;
  quantite: string;
  prix_unitaire?: string;
}

export interface VentePayload {
  client: number;
  lignes: LigneVentePayload[];
  montant_paye?: string;
  mode_paiement?: ModePaiement;
  cle_idempotence?: string;
}

export interface PaiementVente {
  id: number;
  montant: string;
  mode_paiement: ModePaiement;
  mode_paiement_display: string;
  reference_transaction: string;
  commentaire: string;
  date_creation: string;
}

export interface PaiementVentePayload {
  montant: string;
  mode_paiement?: ModePaiementReel;
  reference_transaction?: string;
  commentaire?: string;
}

export interface FactureLigne {
  produit?: string;
  nom_produit?: string;
  unite?: string;
  unite_nom?: string;
  quantite?: string;
  prix_unitaire?: string;
  sous_total?: string;
}

export interface Facture {
  id: number;
  numero: string;
  vente: number;
  vente_reference: string;
  vente_statut: StatutVente;
  date_emission: string;
  nom_commerce: string;
  fournisseur_adresse: string;
  fournisseur_telephone: string;
  client_nom: string;
  client_telephone: string;
  client_adresse: string;
  montant_total: string;
  montant_paye: string;
  reste_a_payer: string;
  montant_paye_emission: string;
  reste_a_payer_emission: string;
  devise: string;
  modes_paiement: string[] | Record<string, string>;
  lignes: FactureLigne[];
  est_payee: boolean;
  lien_pdf: string;
  lien_public: string;
  date_creation: string;
}

export interface NotificationClient {
  id: number;
  type_notification: TypeNotificationClient;
  type_display: string;
  titre: string;
  message: string;
  lien: string;
  lue: boolean;
  date_lecture: string | null;
  fournisseur_nom: string;
  vente: number | null;
  vente_reference: string | null;
  facture: number | null;
  facture_numero: string | null;
  date_creation: string;
}

export interface NotificationExterne {
  id: number;
  notification: number;
  notification_titre: string;
  client_nom: string;
  canal: CanalNotification;
  canal_display: string;
  statut: StatutNotificationExterne;
  statut_display: string;
  tentatives: number;
  tentatives_max: number;
  derniere_erreur: string;
  provider_message_id: string;
  date_creation: string;
  date_envoi: string | null;
  date_prochaine_tentative: string | null;
}

export interface DetteCommerciale {
  id: number;
  client: number;
  client_nom: string;
  vente: number;
  vente_reference: string;
  numero_facture: string;
  montant_initial: string;
  montant_restant: string;
  statut: StatutDette;
  statut_display: string;
  date_creation: string;
  date_modification: string;
}

export interface ConfigurationNotification {
  sms_actif: boolean;
  whatsapp_actif: boolean;
  date_modification: string;
}

export interface StatistiquesCommerce {
  produits: {
    total: number;
    actifs: number;
    en_alerte: number;
    en_rupture: number;
  };
  ventes: {
    nombre: number;
    montant_total: string;
    montant_encaisse: string;
    creances: string;
    marge: string;
    nombre_clients_acheteurs: number;
  };
  dettes: {
    nombre_ouvertes: number;
    montant_restant: string;
  };
  notifications: {
    echouees: number;
  };
  top_produits: {
    nom_produit: string;
    quantite: string;
    montant: string;
  }[];
}

export interface StatistiquesCommerceFournisseur {
  fournisseur: number;
  nom_entreprise: string;
  code_entreprise: string;
  nombre_produits: number;
  nombre_ventes: number;
  volume_ventes: string;
  montant_encaisse: string;
  creances: string;
}

export interface StatistiquesCommerceAdmin {
  totaux: {
    fournisseurs_actifs: number;
    produits: number;
    ventes: number;
    volume_ventes: string;
    montant_encaisse: string;
    creances: string;
  };
  anomalies: {
    ventes_incoherentes: number;
    produits_stock_negatif: number;
    notifications_echouees: number;
  };
  par_fournisseur: StatistiquesCommerceFournisseur[];
}
