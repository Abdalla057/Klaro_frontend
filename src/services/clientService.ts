import api from "./api";
import { fetchAllPages, type AllPagesResult } from "./pagination";
import type { Paginated } from "../types/api";
import type {
  AttributionSoldeRequest,
  Client,
  ClientCreate,
  ClientUpdate,
  CodeActivationResponse,
  SoldeClient,
  TransactionFinanciere,
} from "../types/fournisseur";

export function getAllClients(): Promise<AllPagesResult<Client>> {
  return fetchAllPages<Client>("/api/clients/");
}

export async function getMonProfilClient(): Promise<Client | null> {
  const response = await api.get<Paginated<Client>>("/api/clients/");
  return response.data.results[0] ?? null;
}

export async function createClient(data: ClientCreate): Promise<Client> {
  const response = await api.post<Client>("/api/clients/", data);
  return response.data;
}

export async function updateClient(id: number, data: ClientUpdate): Promise<Client> {
  const response = await api.patch<Client>(`/api/clients/${id}/`, data);
  return response.data;
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/api/clients/${id}/`);
}

export async function resendClientCode(telephone: string): Promise<CodeActivationResponse> {
  const response = await api.post<CodeActivationResponse>("/api/clients/renvoyer-code/", {
    telephone,
  });
  return response.data;
}

export async function attribuerSoldeClient(
  id: number,
  data: AttributionSoldeRequest,
): Promise<TransactionFinanciere> {
  const response = await api.post<TransactionFinanciere>(
    `/api/clients/${id}/attribuer-solde/`,
    data,
  );
  return response.data;
}

export async function getClientSolde(id: number): Promise<SoldeClient> {
  const response = await api.get<SoldeClient>(`/api/clients/${id}/solde/`);
  return response.data;
}

export function getAllClientTransactions(id: number): Promise<AllPagesResult<TransactionFinanciere>> {
  return fetchAllPages<TransactionFinanciere>(`/api/clients/${id}/transactions/`);
}
