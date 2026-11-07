import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getAllDecaissements, getAllTransactions } from "../../../services/financeService";
import type { DemandeDecaissement } from "../../../types/fournisseur";
import { formatMoney, formatRelativeDate } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { CardSkeleton, Skeleton } from "../../../shared/ui/loading";
import { StatCard } from "../../../shared/ui/stat-card";
import { cn } from "../../../shared/utils/cn";
import { useClient } from "../context/clientContextCore";
import { ClientBalanceCard } from "../components/ClientBalanceCard";
import { ClientDemandeDetailModal } from "../components/ClientDemandeDetailModal";
import {
  buildRecentTransactions,
  clientFirstName,
  clientFullName,
  computeClientStats,
} from "../lib/dashboard";
import {
  compteClientStatus,
  DEMANDE_CLIENT_STATUS,
  TRANSACTION_CLIENT_SENS_LABELS,
  TRANSACTION_CLIENT_TYPE_LABELS,
} from "../lib/status";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.6fr]">
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <CardSkeleton className="h-80" />
        <CardSkeleton className="h-80" />
      </div>
    </div>
  );
}

function QuickAction({
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
      className="group flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-3 transition-all hover:border-brand/20 hover:bg-brand-soft/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-white">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <ArrowRight
        className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export function ClientDashboardPage() {
  const { profil, solde, loading: profilLoading, error: profilError, refresh } = useClient();
  const decaissements = useAllPages(getAllDecaissements);
  const transactions = useAllPages(getAllTransactions);
  const [viewing, setViewing] = useState<DemandeDecaissement | null>(null);

  const demandes = useMemo(() => decaissements.data?.items ?? [], [decaissements.data]);
  const transactionItems = useMemo(
    () => transactions.data?.items ?? [],
    [transactions.data],
  );

  const stats = useMemo(() => computeClientStats(demandes), [demandes]);
  const recentDemandes = useMemo(
    () =>
      [...demandes]
        .sort(
          (a, b) =>
            new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
        )
        .slice(0, 4),
    [demandes],
  );
  const recentTransactions = useMemo(
    () => buildRecentTransactions(transactionItems, 5),
    [transactionItems],
  );

  const status = compteClientStatus(Boolean(profil?.compte_active));
  const firstName = clientFirstName(profil);
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  if (profilLoading || decaissements.loading || transactions.loading) {
    return <DashboardSkeleton />;
  }

  const error = profilError ?? decaissements.error ?? transactions.error;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refresh();
          decaissements.refetch();
          transactions.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
            Bonjour, {firstName}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Votre espace remboursement
          </h1>
          <p className="mt-1 text-sm text-muted">
            Suivi de {clientFullName(profil)} — {today}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone}>
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {status.label}
          </Badge>
          <Button
            asChild
            className="bg-brand text-white hover:bg-brand-dark"
          >
            <Link to="/client/demandes/nouvelle">
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </Link>
          </Button>
        </div>
      </section>

      {!profil?.compte_active && (
        <Alert variant="warning" title="Compte en attente d'activation">
          Vous devez activer votre compte avec le code fourni par votre fournisseur avant de
          pouvoir demander un décaissement.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.6fr]">
        <ClientBalanceCard solde={solde} />

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Demandes de décaissement"
            value={stats.totalDemandes}
            hint="Depuis la création de votre compte"
            icon={<FileClock className="h-4 w-4" aria-hidden="true" />}
            tone="brand"
          />
          <StatCard
            label="En attente"
            value={stats.enAttente}
            hint="En attente de confirmation d'un agent"
            icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
            tone="warning"
          />
          <StatCard
            label="Confirmées par l'agent"
            value={stats.confirmeesAgent}
            hint="En attente de la décision du fournisseur"
            icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
            tone="brand"
          />
          <StatCard
            label="Approuvées"
            value={stats.approuvees}
            hint={`${formatMoney(stats.montantEnCours)} encore en cours`}
            icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            tone="warning"
          />
          <StatCard
            label="Payées"
            value={stats.payees}
            hint={`${formatMoney(stats.montantPaye)} reçus`}
            icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
            tone="success"
          />
          <StatCard
            label="Refusées / annulées"
            value={stats.refusees + stats.annulees}
            hint="Demandes sans suite"
            icon={<ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}
            tone="neutral"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Mes dernières demandes</h2>
              <p className="mt-0.5 text-sm text-muted">Suivi des décaissements demandés.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/client/demandes">
                Tout voir
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentDemandes.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucune demande"
                description="Votre première demande de décaissement apparaîtra ici."
                action={
                  <Button asChild className="bg-brand text-white hover:bg-brand-dark">
                    <Link to="/client/demandes/nouvelle">
                      <Plus className="h-4 w-4" />
                      Demander un décaissement
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Référence</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentDemandes.map((demande) => {
                    const statusConfig = DEMANDE_CLIENT_STATUS[demande.statut];

                    return (
                      <tr key={demande.id} className="transition-colors hover:bg-surface/60">
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{demande.reference}</p>
                          <p className="mt-0.5 text-xs text-muted">#{demande.id}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink">
                          {formatMoney(demande.montant)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">
                          {formatRelativeDate(demande.date_creation)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setViewing(demande)}
                          >
                            <Eye className="h-4 w-4" />
                            Détail
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div>
              <h2 className="text-base font-semibold text-ink">Actions rapides</h2>
              <p className="mt-0.5 text-sm text-muted">Les gestes essentiels de votre compte.</p>
            </div>
            <div className="mt-4 grid gap-2">
              <QuickAction
                to="/client/demandes/nouvelle"
                label="Demander un décaissement"
                hint="Soumettre une demande de retrait"
                icon={Plus}
              />
              <QuickAction
                to="/client/solde"
                label="Consulter mon solde"
                hint="Détail du solde et montants en cours"
                icon={Wallet}
              />
              <QuickAction
                to="/client/demandes"
                label="Suivre mes demandes"
                hint={`${stats.enAttente + stats.confirmeesAgent + stats.approuvees} demande(s) en cours`}
                icon={FileClock}
              />
              <QuickAction
                to="/client/transactions"
                label="Historique des transactions"
                hint="Tous vos mouvements financiers"
                icon={ArrowLeftRight}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold text-ink">Activité récente</h2>
            <p className="mt-0.5 text-sm text-muted">Derniers mouvements sur votre compte.</p>

            {recentTransactions.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="Aucune activité"
                  description="Vos encaissements et décaissements apparaîtront ici."
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-1">
                {recentTransactions.map(({ id, transaction }) => {
                  const isCredit = transaction.sens === "CREDIT";

                  return (
                    <li
                      key={id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface"
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          isCredit
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600",
                        )}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {TRANSACTION_CLIENT_TYPE_LABELS[transaction.type_transaction]}
                        </span>
                        <span className="block text-xs text-muted">
                          {TRANSACTION_CLIENT_SENS_LABELS[transaction.sens]} —{" "}
                          {formatRelativeDate(transaction.date_creation)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold",
                          isCredit ? "text-emerald-700" : "text-red-700",
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {formatMoney(transaction.montant)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link to="/client/transactions">
                Voir toutes les transactions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>
        </div>
      </div>

      <ClientDemandeDetailModal demande={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}

export default ClientDashboardPage;
