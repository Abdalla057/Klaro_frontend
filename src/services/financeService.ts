import api from "./api";
import { fetchAllPages, type AllPagesResult } from "./pagination";
import type {
  DemandeDecaissement,
  DemandeDecaissementCreate,
  RegularisationRequest,
  SoldeClient,
  StatistiquesFinancieres,
  TransactionFinanciere,
} from "../types/fournisseur";

export async function getMonSolde(): Promise<SoldeClient> {
  const response = await api.get<SoldeClient>("/api/finances/solde/");
  return response.data;
}

export async function getDecaissement(id: number): Promise<DemandeDecaissement> {
  const response = await api.get<DemandeDecaissement>(`/api/finances/decaissements/${id}/`);
  return response.data;
}

export async function createDemandeDecaissement(
  data: DemandeDecaissementCreate,
): Promise<DemandeDecaissement> {
  const response = await api.post<DemandeDecaissement>("/api/finances/decaissements/", data);
  return response.data;
}

export async function getTransaction(id: number): Promise<TransactionFinanciere> {
  const response = await api.get<TransactionFinanciere>(`/api/finances/transactions/${id}/`);
  return response.data;
}

export function getAllTransactions(): Promise<AllPagesResult<TransactionFinanciere>> {
  return fetchAllPages<TransactionFinanciere>("/api/finances/transactions/");
}

export function getAllDecaissements(): Promise<AllPagesResult<DemandeDecaissement>> {
  return fetchAllPages<DemandeDecaissement>("/api/finances/decaissements/");
}

export async function getStatistiquesFinancieres(): Promise<StatistiquesFinancieres> {
  const response = await api.get<StatistiquesFinancieres>("/api/finances/statistiques/");
  return response.data;
}

export async function regulariserClient(
  data: RegularisationRequest,
): Promise<TransactionFinanciere> {
  const response = await api.post<TransactionFinanciere>(
    "/api/finances/transactions/regulariser/",
    data,
  );
  return response.data;
}

export async function confirmerDecaissement(id: number): Promise<DemandeDecaissement> {
  const response = await api.post<DemandeDecaissement>(
    `/api/finances/decaissements/${id}/confirmer/`,
  );
  return response.data;
}

export async function approuverDecaissement(id: number): Promise<DemandeDecaissement> {
  const response = await api.post<DemandeDecaissement>(
    `/api/finances/decaissements/${id}/approuver/`,
  );
  return response.data;
}

export async function payerDecaissement(id: number): Promise<DemandeDecaissement> {
  const response = await api.post<DemandeDecaissement>(
    `/api/finances/decaissements/${id}/payer/`,
  );
  return response.data;
}

export async function refuserDecaissement(
  id: number,
  motif: string,
): Promise<DemandeDecaissement> {
  const response = await api.post<DemandeDecaissement>(
    `/api/finances/decaissements/${id}/refuser/`,
    { motif },
  );
  return response.data;
}

export async function annulerDecaissement(id: number): Promise<DemandeDecaissement> {
  const response = await api.post<DemandeDecaissement>(
    `/api/finances/decaissements/${id}/annuler/`,
  );
  return response.data;
}
