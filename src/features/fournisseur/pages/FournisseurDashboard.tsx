import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Clock,
  CreditCard,
  Plus,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import { getAllClients } from "../../../services/clientService";
import { getAllEncaissements } from "../../../services/encaissementService";
import { getStatistiquesFournisseur } from "../../../services/fournisseurService";
import type { StatistiquesFournisseur } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { CardSkeleton, Skeleton, TableSkeleton } from "../../../shared/ui/loading";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { PageHeader } from "../../../shared/ui/page-header";
import { StatCard } from "../../../shared/ui/stat-card";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate, formatMoney } from "../lib/format";
import {
  ENCAISSEMENT_STATUS,
  abonnementStatusLabel,
  abonnementStatusTone,
} from "../lib/status";

function QuotaRow({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number | null;
}) {
  const percent = max === null ? 100 : max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-ink">
          {used}
          {max === null ? " / illimité" : ` / ${max}`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-soft">
        <div className="h-full rounded-full bg-brand-accent" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  label,
  hint,
  icon: Icon,
}: {
  to: string;
  label: string;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-brand/20 hover:bg-brand-soft/50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-brand transition-colors group-hover:bg-white">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
          <TableSkeleton rows={5} columns={4} />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function FournisseurDashboard() {
  const encaissements = useAllPages(getAllEncaissements);
  const clients = useAllPages(getAllClients);
  const {
    profil,
    abonnement,
    loading: profilLoading,
    error: profilError,
    refresh,
  } = useFournisseur();

  const [stats, setStats] = useState<StatistiquesFournisseur | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsKey, setStatsKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getStatistiquesFournisseur()
      .then((value) => {
        if (cancelled) return;
        setStats(value);
        setStatsError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatsError(getApiError(error).message);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statsKey]);

  const items = useMemo(() => encaissements.data?.items ?? [], [encaissements.data]);
  const clientItems = useMemo(() => clients.data?.items ?? [], [clients.data]);
  const clientMap = useMemo(
    () => new Map(clientItems.map((client) => [client.id, client])),
    [clientItems],
  );

  const annules = useMemo(
    () => items.filter((item) => item.statut === "ANNULE").length,
    [items],
  );

  const recent = items.slice(0, 6);
  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? null;
  const statutLabel = abonnementStatusLabel(abonnement?.statut, Boolean(abonnement?.est_actif));
  const statutTone = abonnementStatusTone(abonnement?.statut, Boolean(abonnement?.est_actif));
  const canCreateClient = Boolean(abonnement?.est_actif && abonnement?.peut_creer_client);
  const clientsUsed = abonnement?.utilisation?.clients ?? clients.data?.count ?? 0;
  const clientsMax = abonnement?.quotas?.clients ?? null;
  const agentsUsed = abonnement?.utilisation?.agents ?? 0;
  const agentsMax = abonnement?.quotas?.agents ?? null;
  const joursRestants = abonnement?.jours_restants ?? 0;

  if (profilLoading || statsLoading || encaissements.loading || clients.loading) {
    return <DashboardSkeleton />;
  }

  const error = profilError ?? statsError ?? encaissements.error ?? clients.error;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refresh();
          setStatsLoading(true);
          setStatsKey((key) => key + 1);
          encaissements.refetch();
          clients.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour${profil ? `, ${profil.nom_entreprise}` : ""}`}
        description="Voici une vue d'ensemble de votre activité d'encaissement."
        actions={
          canCreateClient ? (
            <Button asChild className="bg-brand text-white hover:bg-brand-dark">
              <Link to="/fournisseur/clients?action=create">
                <Plus className="h-4 w-4" />
                Ajouter un client
              </Link>
            </Button>
          ) : undefined
        }
      />

      {abonnement && !abonnement.est_actif && (
        <Alert variant="warning" title="Abonnement inactif">
          Les créations de clients et d'agents ainsi que les décisions sur les décaissements sont
          désactivées.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Montant encaissé"
          value={formatMoney(stats?.montant_encaisse, devise)}
          hint={`${stats?.nombre_encaissements ?? 0} encaissement(s) confirmé(s)`}
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Solde total clients"
          value={formatMoney(stats?.solde_total_clients, devise)}
          hint="Crédit restant dû par vos clients"
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Décaissements en cours"
          value={stats?.decaissements_en_cours ?? 0}
          hint={formatMoney(stats?.montant_decaissements_en_cours, devise)}
          icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Clients"
          value={stats?.nombre_clients ?? clientsUsed}
          hint={`${stats?.nombre_clients_actifs ?? 0} actif(s) • ${
            clientsMax === null ? "quota illimité" : `sur ${clientsMax} autorisés`
          }`}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Abonnement"
          value={<Badge tone={statutTone}>{statutLabel}</Badge>}
          hint={
            abonnement?.est_actif
              ? `${joursRestants} jour${joursRestants > 1 ? "s" : ""} restant${joursRestants > 1 ? "s" : ""}`
              : "Renouvellement nécessaire"
          }
          icon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
          tone={abonnement?.est_actif ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Encaissements récents</h2>
              <p className="text-sm text-muted">Les dernières opérations de vos clients.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/fournisseur/encaissements">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucun encaissement pour le moment"
                description="Les encaissements initiés par vos clients apparaîtront ici."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Référence</th>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((encaissement) => {
                    const status = ENCAISSEMENT_STATUS[encaissement.statut];
                    const client = clientMap.get(encaissement.client);

                    return (
                      <tr key={encaissement.id} className="transition-colors hover:bg-surface/60">
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                          #{encaissement.id}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">
                            {client
                              ? [client.prenom, client.nom].filter(Boolean).join(" ") ||
                                client.telephone
                              : `Client #${encaissement.client}`}
                          </p>
                          {client && (
                            <p className="text-xs text-muted">{client.telephone}</p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                          {formatMoney(encaissement.montant, devise)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted">
                          {formatDate(encaissement.date_creation, true)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {annules > 0 && (
            <p className="border-t border-border px-5 py-3 text-xs text-muted">
              {annules} encaissement{annules > 1 ? "s" : ""} annulé{annules > 1 ? "s" : ""}.
            </p>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Raccourcis</h2>
            <div className="mt-4 grid gap-2">
              <QuickLink
                to="/fournisseur/encaissements"
                label="Encaissements"
                hint="Consulter et annuler les opérations en attente"
                icon={Wallet}
              />
              <QuickLink
                to="/fournisseur/agents"
                label="Agents"
                hint={
                  agentsUsed > 0
                    ? `Gérer mes ${agentsUsed} agent${agentsUsed > 1 ? "s" : ""}`
                    : "Ajouter mon premier agent"
                }
                icon={UserRound}
              />
              <QuickLink
                to="/fournisseur/finances"
                label="Finances"
                hint="Transactions, soldes et décaissements"
                icon={Banknote}
              />
              <QuickLink
                to="/fournisseur/clients"
                label="Mes clients"
                hint="Gérer les comptes de mes clients"
                icon={Users}
              />
              <QuickLink
                to="/fournisseur/abonnement"
                label="Mon abonnement"
                hint="Consulter mes quotas et mon échéance"
                icon={CreditCard}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Mon abonnement</h2>
                <p className="text-sm text-muted">{abonnement?.plan?.nom ?? "Aucun plan actif"}</p>
              </div>
              <Badge tone={statutTone}>{statutLabel}</Badge>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Échéance</dt>
                <dd className="font-medium text-ink">{formatDate(abonnement?.date_fin)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Jours restants</dt>
                <dd className="font-medium text-ink">{joursRestants}</dd>
              </div>
            </dl>

            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <QuotaRow label="Clients" used={clientsUsed} max={clientsMax} />
              <QuotaRow label="Agents" used={agentsUsed} max={agentsMax} />
            </div>

            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link to="/fournisseur/abonnement">Voir le détail</Link>
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
