import api from "./api";
import { fetchAllPages, type AllPagesResult } from "./pagination";
import type {
  AbonnementAdmin,
  AbonnementCreationPayload,
  FournisseurSupervision,
  PaiementAbonnement,
  PaiementCreationPayload,
  PeriodeStatistique,
  PlanAbonnement,
  RenouvellementPayload,
  SerieChiffreAffaires,
  StatistiquesAbonnements,
  StatistiquesFinancieres,
  TableauDeBord,
} from "../types/superAdmin";

export async function getTableauDeBord(): Promise<TableauDeBord> {
  const response = await api.get<TableauDeBord>("/api/super-admin/tableau-de-bord/");
  return response.data;
}

export async function getStatistiquesFinancieres(
  dateReference?: string,
): Promise<StatistiquesFinancieres> {
  const response = await api.get<StatistiquesFinancieres>(
    "/api/super-admin/statistiques/financieres/",
    { params: dateReference ? { date_reference: dateReference } : undefined },
  );
  return response.data;
}

export async function getSerieChiffreAffaires(
  periode: PeriodeStatistique,
  granularite?: "jour" | "semaine" | "mois",
): Promise<SerieChiffreAffaires> {
  const response = await api.get<SerieChiffreAffaires>(
    "/api/super-admin/statistiques/revenus/",
    { params: { periode, ...(granularite ? { granularite } : {}) } },
  );
  return response.data;
}

export async function getStatistiquesAbonnements(
  periode: PeriodeStatistique,
): Promise<StatistiquesAbonnements> {
  const response = await api.get<StatistiquesAbonnements>(
    "/api/super-admin/statistiques/abonnements/",
    { params: { periode } },
  );
  return response.data;
}

export function getAllFournisseursSupervision(): Promise<
  AllPagesResult<FournisseurSupervision>
> {
  return fetchAllPages<FournisseurSupervision>("/api/super-admin/fournisseurs/");
}

export async function suspendreFournisseur(
  id: number,
  motif: string,
): Promise<FournisseurSupervision> {
  const response = await api.post<FournisseurSupervision>(
    `/api/super-admin/fournisseurs/${id}/suspendre/`,
    { motif },
  );
  return response.data;
}

export async function reactiverFournisseur(
  id: number,
): Promise<FournisseurSupervision> {
  const response = await api.post<FournisseurSupervision>(
    `/api/super-admin/fournisseurs/${id}/reactiver/`,
  );
  return response.data;
}

export function getAllAbonnements(): Promise<AllPagesResult<AbonnementAdmin>> {
  return fetchAllPages<AbonnementAdmin>("/api/abonnements/abonnements/");
}

export function getAllPlans(): Promise<AllPagesResult<PlanAbonnement>> {
  return fetchAllPages<PlanAbonnement>("/api/abonnements/plans/");
}

export async function creerAbonnement(
  payload: AbonnementCreationPayload,
): Promise<AbonnementAdmin> {
  const response = await api.post<AbonnementAdmin>(
    "/api/abonnements/abonnements/",
    payload,
  );
  return response.data;
}

export async function renouvelerAbonnement(
  id: number,
  payload: RenouvellementPayload,
): Promise<AbonnementAdmin> {
  const response = await api.post<AbonnementAdmin>(
    `/api/abonnements/abonnements/${id}/renouveler/`,
    payload,
  );
  return response.data;
}

export async function suspendreAbonnement(
  id: number,
  motif: string,
): Promise<AbonnementAdmin> {
  const response = await api.post<AbonnementAdmin>(
    `/api/abonnements/abonnements/${id}/suspendre/`,
    { motif },
  );
  return response.data;
}

export async function reactiverAbonnement(id: number): Promise<AbonnementAdmin> {
  const response = await api.post<AbonnementAdmin>(
    `/api/abonnements/abonnements/${id}/reactiver/`,
  );
  return response.data;
}

export async function annulerAbonnement(
  id: number,
  motif: string,
): Promise<AbonnementAdmin> {
  const response = await api.post<AbonnementAdmin>(
    `/api/abonnements/abonnements/${id}/annuler/`,
    { motif },
  );
  return response.data;
}

export function getAllPaiements(): Promise<AllPagesResult<PaiementAbonnement>> {
  return fetchAllPages<PaiementAbonnement>("/api/abonnements/paiements/");
}

export async function creerPaiement(
  payload: PaiementCreationPayload,
): Promise<PaiementAbonnement> {
  const response = await api.post<PaiementAbonnement>(
    "/api/abonnements/paiements/",
    payload,
  );
  return response.data;
}

export async function confirmerPaiement(
  id: number,
): Promise<PaiementAbonnement> {
  const response = await api.post<PaiementAbonnement>(
    `/api/abonnements/paiements/${id}/confirmer/`,
  );
  return response.data;
}

export async function refuserPaiement(
  id: number,
  motif: string,
): Promise<PaiementAbonnement> {
  const response = await api.post<PaiementAbonnement>(
    `/api/abonnements/paiements/${id}/refuser/`,
    { motif },
  );
  return response.data;
}

export async function annulerPaiement(
  id: number,
  motif: string,
): Promise<PaiementAbonnement> {
  const response = await api.post<PaiementAbonnement>(
    `/api/abonnements/paiements/${id}/annuler/`,
    { motif },
  );
  return response.data;
}
