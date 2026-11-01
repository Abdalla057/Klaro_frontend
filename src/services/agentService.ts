import api from "./api";
import { fetchAllPages, type AllPagesResult } from "./pagination";
import type { Paginated } from "../types/api";
import type {
  Agent,
  AgentCreate,
  AgentUpdate,
  CodeActivationResponse,
  StatistiquesAgent,
} from "../types/fournisseur";

export function getAllAgents(): Promise<AllPagesResult<Agent>> {
  return fetchAllPages<Agent>("/api/agents/");
}

export async function getMonProfilAgent(): Promise<Agent | null> {
  const response = await api.get<Paginated<Agent>>("/api/agents/");
  return response.data.results[0] ?? null;
}

export async function createAgent(data: AgentCreate): Promise<Agent> {
  const response = await api.post<Agent>("/api/agents/", data);
  return response.data;
}

export async function updateAgent(id: number, data: AgentUpdate): Promise<Agent> {
  const response = await api.patch<Agent>(`/api/agents/${id}/`, data);
  return response.data;
}

export async function deleteAgent(id: number): Promise<void> {
  await api.delete(`/api/agents/${id}/`);
}

export async function resendAgentCode(telephone: string): Promise<CodeActivationResponse> {
  const response = await api.post<CodeActivationResponse>("/api/agents/renvoyer-code/", {
    telephone,
  });
  return response.data;
}

export async function getAgentStatistiques(id: number): Promise<StatistiquesAgent> {
  const response = await api.get<StatistiquesAgent>(`/api/agents/${id}/statistiques/`);
  return response.data;
}
