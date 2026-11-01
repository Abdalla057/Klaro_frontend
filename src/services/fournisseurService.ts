import api from "./api";
import type { Paginated } from "../types/api";
import type {
  Fournisseur,
  FournisseurAbonnement,
  FournisseurUpdate,
  StatistiquesFournisseur,
} from "../types/fournisseur";

export async function getMonProfil(): Promise<Fournisseur | null> {
  const response = await api.get<Paginated<Fournisseur>>("/api/fournisseurs/");
  return response.data.results[0] ?? null;
}

export async function updateMonProfil(id: number, data: FournisseurUpdate): Promise<Fournisseur> {
  const response = await api.patch<Fournisseur>(`/api/fournisseurs/${id}/`, data);
  return response.data;
}

export async function getMonAbonnement(): Promise<FournisseurAbonnement> {
  const response = await api.get<FournisseurAbonnement>("/api/fournisseurs/abonnement/");
  return response.data;
}

export async function getStatistiquesFournisseur(): Promise<StatistiquesFournisseur> {
  const response = await api.get<StatistiquesFournisseur>("/api/fournisseurs/statistiques/");
  return response.data;
}
