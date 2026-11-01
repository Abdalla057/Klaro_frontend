import api from "./api";
import type { ChangementMotDePasseRequest, DetailResponse } from "../types/fournisseur";

export async function changePassword(data: ChangementMotDePasseRequest): Promise<DetailResponse> {
  const response = await api.post<DetailResponse>("/api/comptes/mot-de-passe/", data);
  return response.data;
}
