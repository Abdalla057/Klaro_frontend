import api from "./api";
import { fetchAllPages, type AllPagesResult } from "./pagination";
import type {
  ConfirmationDemandePayload,
  DemandeAbonnement,
  DemandeAbonnementCreationPayload,
  EvenementDemande,
  SoumissionPaiementPayload,
} from "../types/demandesAbonnement";
import type {
  AbonnementAdmin,
  PaiementAbonnement,
  PlanAbonnement,
} from "../types/superAdmin";

const DEMANDES_FOURNISSEUR = "/api/abonnements/demandes/";
const DEMANDES_ADMIN = "/api/super-admin/demandes-abonnement/";

function versFormulaire(
  payload: Record<string, string | number | boolean | File | null | undefined>,
): FormData {
  const formulaire = new FormData();
  for (const [cle, valeur] of Object.entries(payload)) {
    if (valeur === undefined || valeur === null || valeur === "") continue;
    formulaire.append(cle, valeur instanceof File ? valeur : String(valeur));
  }
  return formulaire;
}

function declencherTelechargement(blob: Blob, nomFichier: string) {
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

export function getPlansDisponibles(): Promise<AllPagesResult<PlanAbonnement>> {
  return fetchAllPages<PlanAbonnement>("/api/abonnements/plans/");
}

export function getDemandesFournisseur(): Promise<AllPagesResult<DemandeAbonnement>> {
  return fetchAllPages<DemandeAbonnement>(DEMANDES_FOURNISSEUR);
}

export function getHistoriqueAbonnementsFournisseur(): Promise<AllPagesResult<AbonnementAdmin>> {
  return fetchAllPages<AbonnementAdmin>("/api/fournisseurs/abonnements/");
}

export function getHistoriquePaiementsFournisseur(): Promise<AllPagesResult<PaiementAbonnement>> {
  return fetchAllPages<PaiementAbonnement>("/api/fournisseurs/paiements/");
}

export async function getDemandeFournisseur(id: string): Promise<DemandeAbonnement> {
  const response = await api.get<DemandeAbonnement>(`${DEMANDES_FOURNISSEUR}${id}/`);
  return response.data;
}

export async function creerDemandeAbonnement(
  payload: DemandeAbonnementCreationPayload,
): Promise<DemandeAbonnement> {
  const response = await api.post<DemandeAbonnement>(
    DEMANDES_FOURNISSEUR,
    versFormulaire({
      plan: payload.plan,
      type_operation: payload.type_operation,
      abonnement_cible: payload.abonnement_cible ?? undefined,
      moyen_paiement: payload.moyen_paiement,
      prestataire: payload.prestataire,
      reference_transaction: payload.reference_transaction,
      preuve_paiement: payload.preuve_paiement,
      cle_idempotence: payload.cle_idempotence,
      commentaire_fournisseur: payload.commentaire_fournisseur,
    }),
  );
  return response.data;
}

export async function soumettrePaiementDemande(
  id: string,
  payload: SoumissionPaiementPayload,
): Promise<DemandeAbonnement> {
  const response = await api.post<DemandeAbonnement>(
    `${DEMANDES_FOURNISSEUR}${id}/soumettre-paiement/`,
    versFormulaire({
      reference_transaction: payload.reference_transaction,
      preuve_paiement: payload.preuve_paiement,
      moyen_paiement: payload.moyen_paiement,
      prestataire: payload.prestataire,
      commentaire: payload.commentaire,
    }),
  );
  return response.data;
}

export async function annulerDemandeFournisseur(
  id: string,
  motif: string,
): Promise<DemandeAbonnement> {
  const response = await api.post<DemandeAbonnement>(
    `${DEMANDES_FOURNISSEUR}${id}/annuler/`,
    { motif },
  );
  return response.data;
}

export function getEvenementsDemandeFournisseur(
  id: string,
): Promise<AllPagesResult<EvenementDemande>> {
  return fetchAllPages<EvenementDemande>(`${DEMANDES_FOURNISSEUR}${id}/evenements/`);
}

export async function telechargerPreuveFournisseur(
  id: string,
  reference: string,
): Promise<void> {
  const response = await api.get<Blob>(`${DEMANDES_FOURNISSEUR}${id}/preuve/`, {
    responseType: "blob",
  });
  declencherTelechargement(response.data, `preuve-${reference}`);
}

export function getDemandesAdmin(): Promise<AllPagesResult<DemandeAbonnement>> {
  return fetchAllPages<DemandeAbonnement>(DEMANDES_ADMIN);
}

export async function getDemandeAdmin(id: string): Promise<DemandeAbonnement> {
  const response = await api.get<DemandeAbonnement>(`${DEMANDES_ADMIN}${id}/`);
  return response.data;
}

export function getEvenementsDemandeAdmin(
  id: string,
): Promise<AllPagesResult<EvenementDemande>> {
  return fetchAllPages<EvenementDemande>(`${DEMANDES_ADMIN}${id}/evenements/`);
}

export function getPaiementsDemandeAdmin(
  id: string,
): Promise<AllPagesResult<PaiementAbonnement>> {
  return fetchAllPages<PaiementAbonnement>(`${DEMANDES_ADMIN}${id}/paiements/`);
}

export async function confirmerDemandeAdmin(
  id: string,
  payload: ConfirmationDemandePayload,
): Promise<DemandeAbonnement> {
  const response = await api.post<DemandeAbonnement>(
    `${DEMANDES_ADMIN}${id}/confirmer/`,
    payload,
  );
  return response.data;
}

export async function refuserDemandeAdmin(
  id: string,
  motif: string,
): Promise<DemandeAbonnement> {
  const response = await api.post<DemandeAbonnement>(
    `${DEMANDES_ADMIN}${id}/refuser/`,
    { motif },
  );
  return response.data;
}

export async function annulerDemandeAdmin(
  id: string,
  motif: string,
): Promise<DemandeAbonnement> {
  const response = await api.post<DemandeAbonnement>(
    `${DEMANDES_ADMIN}${id}/annuler/`,
    { motif },
  );
  return response.data;
}

export async function telechargerPreuveAdmin(
  id: string,
  reference: string,
): Promise<void> {
  const response = await api.get<Blob>(`${DEMANDES_ADMIN}${id}/preuve/`, {
    responseType: "blob",
  });
  declencherTelechargement(response.data, `preuve-${reference}`);
}
