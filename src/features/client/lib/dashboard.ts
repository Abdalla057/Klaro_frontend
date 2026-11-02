import type { Client } from "../../../types/fournisseur";
import type { DemandeDecaissement, TransactionFinanciere } from "../../../types/fournisseur";
import type { ClientActivityItem, ClientDashboardStats } from "../types";

function toAmount(value: string | number | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

const STATUTS_EN_COURS = [
  "EN_ATTENTE",
  "CONFIRMATION_AGENT",
  "EN_ATTENTE_VALIDATION",
  "APPROUVE",
] as const;

export function computeClientStats(demandes: DemandeDecaissement[]): ClientDashboardStats {
  const enCours = demandes.filter((demande) =>
    (STATUTS_EN_COURS as readonly string[]).includes(demande.statut),
  );
  const payees = demandes.filter((demande) => demande.statut === "PAYE");

  return {
    totalDemandes: demandes.length,
    enAttente: demandes.filter((demande) => demande.statut === "EN_ATTENTE").length,
    confirmeesAgent: demandes.filter((demande) => demande.statut === "CONFIRMATION_AGENT")
      .length,
    enValidation: demandes.filter((demande) => demande.statut === "EN_ATTENTE_VALIDATION")
      .length,
    approuvees: demandes.filter((demande) => demande.statut === "APPROUVE").length,
    payees: payees.length,
    refusees: demandes.filter((demande) => demande.statut === "REFUSE").length,
    annulees: demandes.filter((demande) => demande.statut === "ANNULE").length,
    montantEnCours: enCours.reduce((total, demande) => total + toAmount(demande.montant), 0),
    montantPaye: payees.reduce((total, demande) => total + toAmount(demande.montant), 0),
  };
}

export function buildRecentTransactions(
  transactions: TransactionFinanciere[],
  limit = 5,
): ClientActivityItem[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
    .slice(0, limit)
    .map((transaction) => ({
      id: `transaction-${transaction.id}`,
      transaction,
    }));
}

export function clientFullName(client: Client | null): string {
  if (!client) return "Client";
  return [client.prenom, client.nom].filter(Boolean).join(" ").trim() || "Client";
}

export function clientInitials(client: Client | null): string {
  if (!client) return "CL";
  const initials = `${client.prenom?.charAt(0) ?? ""}${client.nom?.charAt(0) ?? ""}`.toUpperCase();
  return initials || "CL";
}

export function clientFirstName(client: Client | null): string {
  return client?.prenom?.trim() || "Client";
}
