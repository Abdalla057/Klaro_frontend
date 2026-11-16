import api from "./api";
import type { AllPagesResult } from "./pagination";
import type {
  CategorieProduit,
  CategorieProduitPayload,
  CommandeAchat,
  CommandeAchatPayload,
  ConfigurationNotification,
  DetteCommerciale,
  Facture,
  FournisseurMarchandise,
  FournisseurMarchandisePayload,
  MouvementStock,
  NotificationClient,
  NotificationExterne,
  PaiementVente,
  PaiementVentePayload,
  Produit,
  ProduitPayload,
  ProduitUnite,
  ProduitUnitePayload,
  Reception,
  ReceptionPayload,
  StatistiquesCommerce,
  StatistiquesCommerceAdmin,
  Vente,
  VentePayload,
} from "../types/commerce";

const BASE = "/api/commerce";

async function fetchAllPagesWithParams<T>(
  url: string,
  params: Record<string, string | number | boolean | undefined> = {},
  maxPages = 50,
): Promise<AllPagesResult<T>> {
  const items: T[] = [];
  let count = 0;
  let complete = false;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await api.get<{
      count: number;
      next: string | null;
      results: T[];
    }>(url, { params: { ...params, page } });
    const data = response.data;

    count = data.count;
    items.push(...data.results);

    if (!data.next) {
      complete = true;
      break;
    }
  }

  return { items, count, complete };
}

export interface CommerceFilters {
  [key: string]: string | number | boolean | undefined;
  recherche?: string;
  actif?: boolean;
  statut?: string;
  categorie?: number;
  client?: number;
  produit?: number;
  payee?: boolean;
  mode_paiement?: string;
  type_mouvement?: string;
  canal?: string;
  lue?: boolean;
  fournisseur_marchandise?: number;
  date_debut?: string;
  date_fin?: string;
}

export function getAllCategories(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<CategorieProduit>> {
  return fetchAllPagesWithParams<CategorieProduit>(`${BASE}/categories/`, filters);
}

export async function createCategorie(
  payload: CategorieProduitPayload,
): Promise<CategorieProduit> {
  const response = await api.post<CategorieProduit>(`${BASE}/categories/`, payload);
  return response.data;
}

export async function updateCategorie(
  id: number,
  payload: Partial<CategorieProduitPayload>,
): Promise<CategorieProduit> {
  const response = await api.patch<CategorieProduit>(`${BASE}/categories/${id}/`, payload);
  return response.data;
}

export async function deleteCategorie(id: number): Promise<void> {
  await api.delete(`${BASE}/categories/${id}/`);
}

export function getAllProduits(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<Produit>> {
  return fetchAllPagesWithParams<Produit>(`${BASE}/produits/`, filters);
}

function produitRequestData(payload: Partial<ProduitPayload>) {
  const hasImageChange =
    payload.image instanceof File || payload.supprimer_image;

  if (!hasImageChange) return payload;

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (key === "unites_ecriture") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export async function createProduit(payload: ProduitPayload): Promise<Produit> {
  const response = await api.post<Produit>(
    `${BASE}/produits/`,
    produitRequestData(payload),
  );
  return response.data;
}

export async function updateProduit(
  id: number,
  payload: Partial<ProduitPayload>,
): Promise<Produit> {
  const response = await api.patch<Produit>(
    `${BASE}/produits/${id}/`,
    produitRequestData(payload),
  );
  return response.data;
}

export async function deleteProduit(id: number): Promise<void> {
  await api.delete(`${BASE}/produits/${id}/`);
}

export async function getProduitUnites(id: number): Promise<ProduitUnite[]> {
  const response = await api.get<ProduitUnite[]>(`${BASE}/produits/${id}/unites/`);
  return response.data;
}

export async function createProduitUnite(
  id: number,
  payload: ProduitUnitePayload,
): Promise<ProduitUnite> {
  const response = await api.post<ProduitUnite>(`${BASE}/produits/${id}/unites/`, payload);
  return response.data;
}

export async function entreeStock(
  id: number,
  payload: { quantite: string; motif?: string },
): Promise<MouvementStock> {
  const response = await api.post<MouvementStock>(
    `${BASE}/produits/${id}/entree-stock/`,
    payload,
  );
  return response.data;
}

export function getProduitMouvements(
  id: number,
): Promise<AllPagesResult<MouvementStock>> {
  return fetchAllPagesWithParams<MouvementStock>(`${BASE}/produits/${id}/mouvements/`);
}

export function getAllMouvementsStock(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<MouvementStock>> {
  return fetchAllPagesWithParams<MouvementStock>(`${BASE}/mouvements-stock/`, filters);
}

export function getAllFournisseursMarchandises(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<FournisseurMarchandise>> {
  return fetchAllPagesWithParams<FournisseurMarchandise>(
    `${BASE}/fournisseurs-marchandises/`,
    filters,
  );
}

export async function createFournisseurMarchandise(
  payload: FournisseurMarchandisePayload,
): Promise<FournisseurMarchandise> {
  const response = await api.post<FournisseurMarchandise>(
    `${BASE}/fournisseurs-marchandises/`,
    payload,
  );
  return response.data;
}

export async function updateFournisseurMarchandise(
  id: number,
  payload: Partial<FournisseurMarchandisePayload>,
): Promise<FournisseurMarchandise> {
  const response = await api.patch<FournisseurMarchandise>(
    `${BASE}/fournisseurs-marchandises/${id}/`,
    payload,
  );
  return response.data;
}

export function getAllCommandesAchat(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<CommandeAchat>> {
  return fetchAllPagesWithParams<CommandeAchat>(`${BASE}/commandes-achat/`, filters);
}

export async function createCommandeAchat(
  payload: CommandeAchatPayload,
): Promise<CommandeAchat> {
  const response = await api.post<CommandeAchat>(`${BASE}/commandes-achat/`, payload);
  return response.data;
}

export async function receptionnerCommande(
  id: number,
  payload: ReceptionPayload,
): Promise<Reception> {
  const response = await api.post<Reception>(
    `${BASE}/commandes-achat/${id}/receptionner/`,
    payload,
  );
  return response.data;
}

export function getCommandeReceptions(
  id: number,
): Promise<AllPagesResult<Reception>> {
  return fetchAllPagesWithParams<Reception>(
    `${BASE}/commandes-achat/${id}/receptions/`,
  );
}

export async function annulerCommande(id: number): Promise<CommandeAchat> {
  const response = await api.post<CommandeAchat>(`${BASE}/commandes-achat/${id}/annuler/`);
  return response.data;
}

export function getAllVentes(filters: CommerceFilters = {}): Promise<AllPagesResult<Vente>> {
  return fetchAllPagesWithParams<Vente>(`${BASE}/ventes/`, filters);
}

export async function createVente(payload: VentePayload): Promise<Vente> {
  const response = await api.post<Vente>(`${BASE}/ventes/`, payload);
  return response.data;
}

export async function annulerVente(id: number, motif = ""): Promise<Vente> {
  const response = await api.post<Vente>(`${BASE}/ventes/${id}/annuler/`, {
    motif,
  });
  return response.data;
}

export function getVentePaiements(id: number): Promise<AllPagesResult<PaiementVente>> {
  return fetchAllPagesWithParams<PaiementVente>(`${BASE}/ventes/${id}/paiements/`);
}

export async function ajouterPaiementVente(
  id: number,
  payload: PaiementVentePayload,
): Promise<PaiementVente> {
  const response = await api.post<PaiementVente>(
    `${BASE}/ventes/${id}/paiements/`,
    payload,
  );
  return response.data;
}

export async function getVenteFacture(id: number): Promise<Facture> {
  const response = await api.get<Facture>(`${BASE}/ventes/${id}/facture/`);
  return response.data;
}

export function getAllFactures(filters: CommerceFilters = {}): Promise<AllPagesResult<Facture>> {
  return fetchAllPagesWithParams<Facture>(`${BASE}/factures/`, filters);
}

export async function getFacture(id: number): Promise<Facture> {
  const response = await api.get<Facture>(`${BASE}/factures/${id}/`);
  return response.data;
}

export async function telechargerFacturePdf(id: number): Promise<Blob> {
  const response = await api.get<Blob>(`${BASE}/factures/${id}/pdf/`, {
    responseType: "blob",
  });
  return response.data;
}

export async function ouvrirFacturePdf(id: number): Promise<void> {
  const fenetre = window.open("about:blank", "_blank");
  if (fenetre) {
    fenetre.opener = null;
    fenetre.document.title = "Facture";
  }
  try {
    const blob = await telechargerFacturePdf(id);
    const url = URL.createObjectURL(blob);
    if (fenetre) {
      fenetre.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (erreur) {
    fenetre?.close();
    throw erreur;
  }
}

export function getAllNotifications(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<NotificationClient>> {
  return fetchAllPagesWithParams<NotificationClient>(`${BASE}/notifications/`, filters);
}

export async function getNotificationsNonLues(): Promise<number> {
  const response = await api.get<{ nombre: number }>(`${BASE}/notifications/non-lues/`);
  return response.data.nombre;
}

export async function marquerNotificationLue(id: number): Promise<NotificationClient> {
  const response = await api.post<NotificationClient>(
    `${BASE}/notifications/${id}/marquer-lue/`,
  );
  return response.data;
}

export async function marquerToutesNotificationsLues(): Promise<number> {
  const response = await api.post<{ mises_a_jour: number }>(
    `${BASE}/notifications/tout-marquer-lu/`,
  );
  return response.data.mises_a_jour;
}

export function getAllNotificationsExternes(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<NotificationExterne>> {
  return fetchAllPagesWithParams<NotificationExterne>(
    `${BASE}/notifications-externes/`,
    filters,
  );
}

export async function renvoyerNotificationExterne(
  id: number,
): Promise<NotificationExterne[]> {
  const response = await api.post<NotificationExterne[]>(
    `${BASE}/notifications-externes/${id}/renvoyer/`,
  );
  return response.data;
}

export function getAllDettes(
  filters: CommerceFilters = {},
): Promise<AllPagesResult<DetteCommerciale>> {
  return fetchAllPagesWithParams<DetteCommerciale>(`${BASE}/dettes/`, filters);
}

export async function getConfigurationNotifications(): Promise<ConfigurationNotification> {
  const response = await api.get<ConfigurationNotification>(
    `${BASE}/configuration-notifications/`,
  );
  return response.data;
}

export async function updateConfigurationNotifications(
  payload: Partial<Pick<ConfigurationNotification, "sms_actif" | "whatsapp_actif">>,
): Promise<ConfigurationNotification> {
  const response = await api.patch<ConfigurationNotification>(
    `${BASE}/configuration-notifications/`,
    payload,
  );
  return response.data;
}

export async function getStatistiquesCommerce(): Promise<StatistiquesCommerce> {
  const response = await api.get<StatistiquesCommerce>(`${BASE}/statistiques/`);
  return response.data;
}

export async function getStatistiquesCommerceAdmin(): Promise<StatistiquesCommerceAdmin> {
  const response = await api.get<StatistiquesCommerceAdmin>(
    `${BASE}/admin/statistiques/`,
  );
  return response.data;
}
