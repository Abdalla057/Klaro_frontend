import api from "./api";
import type {
  ActivationRequest,
  ActivationResponse,
  StatutActivation,
} from "../types/auth";

export async function activerCompte(data: ActivationRequest): Promise<ActivationResponse> {
  const response = await api.post<ActivationResponse>("/api/comptes/activation/activer/", data);
  return response.data;
}

export async function getStatutActivation(telephone: string): Promise<StatutActivation> {
  const response = await api.get<StatutActivation>("/api/comptes/activation/statut/", {
    params: { telephone },
  });
  return response.data;
}
