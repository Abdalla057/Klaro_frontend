import api from "./api";
import type {
  ActivationRequest,
  ActivationResponse,
  DefinitionMotDePasseRequest,
  DefinitionMotDePasseResponse,
  StatutActivation,
  VerificationCodeRequest,
  VerificationCodeResponse,
} from "../types/auth";

export async function verifierCodeActivation(
  data: VerificationCodeRequest,
): Promise<VerificationCodeResponse> {
  const response = await api.post<VerificationCodeResponse>(
    "/api/comptes/activation/verifier-code/",
    data,
  );
  return response.data;
}

export async function definirMotDePasseActivation(
  data: DefinitionMotDePasseRequest,
): Promise<DefinitionMotDePasseResponse> {
  const response = await api.post<DefinitionMotDePasseResponse>(
    "/api/comptes/activation/definir-mot-de-passe/",
    data,
  );
  return response.data;
}

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
