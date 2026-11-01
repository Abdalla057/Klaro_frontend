import type { AgentDashboardStats } from "../../../types/agent";
import type {
  Client,
  DemandeDecaissement,
  Encaissement,
  TransactionFinanciere,
} from "../../../types/fournisseur";

function toAmount(value: string | number | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeAgentStats(
  encaissements: Encaissement[],
  decaissements: DemandeDecaissement[],
  clients: Client[],
  agentId: number | null,
): AgentDashboardStats {
  const confirmes = encaissements.filter((item) => item.statut === "CONFIRME");
  const enAttente = encaissements.filter((item) => item.statut === "EN_ATTENTE");
  const annules = encaissements.filter((item) => item.statut === "ANNULE");
  const mesEncaissements = agentId
    ? confirmes.filter((item) => item.agent === agentId)
    : [];

  return {
    totalEncaissements: encaissements.length,
    confirmes: confirmes.length,
    enAttente: enAttente.length,
    annules: annules.length,
    montantConfirme: confirmes.reduce((total, item) => total + toAmount(item.montant), 0),
    montantEnAttente: enAttente.reduce((total, item) => total + toAmount(item.montant), 0),
    decaissementsAConfirmer: decaissements.filter((item) => item.statut === "EN_ATTENTE").length,
    mesRecouvrements: mesEncaissements.length,
    montantCollecte: mesEncaissements.reduce(
      (total, item) => total + toAmount(item.montant),
      0,
    ),
    clientsActifs: clients.filter((client) => client.compte_active).length,
  };
}

export function buildCollectionSeries(
  encaissements: Encaissement[],
  days = 7,
): Array<{ jour: string; montant: number; nombre: number }> {
  const series = Array.from({ length: days }).map((_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));

    return {
      key: dayKey(date),
      jour: new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        day: "2-digit",
      }).format(date),
      montant: 0,
      nombre: 0,
    };
  });

  const index = new Map(series.map((item) => [item.key, item]));

  encaissements
    .filter((item) => item.statut === "CONFIRME" && item.date_confirmation)
    .forEach((item) => {
      const key = dayKey(new Date(item.date_confirmation as string));
      const day = index.get(key);
      if (!day) return;
      day.montant += toAmount(item.montant);
      day.nombre += 1;
    });

  return series.map((item) => ({
    jour: item.jour,
    montant: item.montant,
    nombre: item.nombre,
  }));
}

export type AgentActivity = {
  id: string;
  title: string;
  description: string;
  montant: string;
  date: string;
  href: string;
};

export function buildRecentActivity(
  encaissements: Encaissement[],
  decaissements: DemandeDecaissement[],
  clientMap: Map<number, Client>,
  limit = 8,
): AgentActivity[] {
  const encaissementActivity = encaissements.map((item) => ({
    id: `encaissement-${item.id}`,
    title: `Encaissement #${item.id}`,
    description: clientMap.get(item.client)?.nom
      ? `${clientMap.get(item.client)?.prenom ?? ""} ${clientMap.get(item.client)?.nom ?? ""}`.trim()
      : `Client #${item.client}`,
    montant: item.montant,
    date: item.date_confirmation ?? item.date_creation,
    href: "/agent/encaissements",
  }));

  const decaissementActivity = decaissements.map((item) => ({
    id: `decaissement-${item.id}`,
    title: `Décaissement ${item.reference}`,
    description: item.client_nom,
    montant: item.montant,
    date: item.date_confirmation_agent ?? item.date_creation,
    href: "/agent/decaissements",
  }));

  return [...encaissementActivity, ...decaissementActivity]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function buildRecentTransactions(
  transactions: TransactionFinanciere[],
  limit = 5,
): TransactionFinanciere[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
    .slice(0, limit);
}

export function agentFullName(agent: { nom: string; prenom: string } | null): string {
  if (!agent) return "Agent";
  return `${agent.prenom} ${agent.nom}`.trim() || "Agent";
}

export function agentInitials(agent: { nom: string; prenom: string } | null): string {
  if (!agent) return "AG";
  return `${agent.prenom.charAt(0)}${agent.nom.charAt(0)}`.toUpperCase() || "AG";
}
