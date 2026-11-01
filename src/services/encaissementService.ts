import api from "./api";
import { fetchAllPages, type AllPagesResult } from "./pagination";
import type {
  CollecteEncaissementRequest,
  ConfirmationEncaissementCodeRequest,
} from "../types/agent";
import type { Encaissement } from "../types/fournisseur";

export function getAllEncaissements(): Promise<AllPagesResult<Encaissement>> {
  return fetchAllPages<Encaissement>("/api/encaissements/");
}

export async function collecterEncaissement(
  data: CollecteEncaissementRequest,
): Promise<Encaissement> {
  const response = await api.post<Encaissement>("/api/encaissements/collecter/", data);
  return response.data;
}

export async function confirmerEncaissement(id: number): Promise<Encaissement> {
  const response = await api.post<Encaissement>(`/api/encaissements/${id}/confirmer/`);
  return response.data;
}

export async function confirmerEncaissementParCode(
  data: ConfirmationEncaissementCodeRequest,
): Promise<Encaissement> {
  const response = await api.post<Encaissement>(
    "/api/encaissements/confirmer-par-code/",
    data,
  );
  return response.data;
}

export async function annulerEncaissement(id: number): Promise<Encaissement> {
  const response = await api.post<Encaissement>(`/api/encaissements/${id}/annuler/`);
  return response.data;
}
