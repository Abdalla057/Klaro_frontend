import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  QrCode,
  ScanLine,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getAllClients } from "../../../services/clientService";
import { getAllEncaissements } from "../../../services/encaissementService";
import { getAllDecaissements, getAllTransactions } from "../../../services/financeService";
import { formatMoney, formatRelativeDate } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { CardSkeleton, Skeleton } from "../../../shared/ui/loading";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { StatCard } from "../../../shared/ui/stat-card";
import { cn } from "../../../shared/utils/cn";
import { useAgent } from "../context/agentContextCore";
import {
  agentFullName,
  buildCollectionSeries,
  buildRecentActivity,
  buildRecentTransactions,
  computeAgentStats,
} from "../lib/dashboard";
import { agentStatus, TRANSACTION_AGENT_STATUS } from "../lib/status";

const compactNumber = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <CardSkeleton className="h-96" />
        <CardSkeleton className="h-96" />
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

export function AgentDashboardPage() {
  const { profil, loading: profilLoading, error: profilError, refresh } = useAgent();
  const encaissements = useAllPages(getAllEncaissements);
  const decaissements = useAllPages(getAllDecaissements);
  const clients = useAllPages(getAllClients);
  const transactions = useAllPages(getAllTransactions);

  const encaissementItems = useMemo(
    () => encaissements.data?.items ?? [],
    [encaissements.data],
  );
  const decaissementItems = useMemo(
    () => decaissements.data?.items ?? [],
    [decaissements.data],
  );
  const clientItems = useMemo(() => clients.data?.items ?? [], [clients.data]);
  const transactionItems = useMemo(
    () => transactions.data?.items ?? [],
    [transactions.data],
  );

  const clientMap = useMemo(
    () => new Map(clientItems.map((client) => [client.id, client])),
    [clientItems],
  );

  const stats = useMemo(
    () => computeAgentStats(encaissementItems, decaissementItems, clientItems, profil?.id ?? null),
    [encaissementItems, decaissementItems, clientItems, profil?.id],
  );

  const series = useMemo(() => buildCollectionSeries(encaissementItems, 7), [encaissementItems]);
  const activity = useMemo(
    () => buildRecentActivity(encaissementItems, decaissementItems, clientMap, 6),
    [encaissementItems, decaissementItems, clientMap],
  );
  const recentTransactions = useMemo(
    () => buildRecentTransactions(transactionItems, 5),
    [transactionItems],
  );

  const fullName = agentFullName(profil);
  const firstName = profil?.prenom || "Agent";
  const status = agentStatus(Boolean(profil?.compte_active));
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const loading =
    profilLoading ||
    encaissements.loading ||
    decaissements.loading ||
    clients.loading ||
    transactions.loading;

  if (loading) return <DashboardSkeleton />;

  const error =
    profilError ?? encaissements.error ?? decaissements.error ?? clients.error ?? transactions.error;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refresh();
          encaissements.refetch();
          decaissements.refetch();
          clients.refetch();
          transactions.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-brand-accent/40 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Tableau de bord
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bonjour, {firstName}
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Voici l'activité de {fullName === "Agent" ? "votre zone" : "votre périmètre"} pour{" "}
              {today}.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {status.label}
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {profil?.zone || "Zone non définie"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Agent #{profil?.id ?? "—"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              asChild
              className="bg-white text-brand shadow-sm hover:bg-white/90"
            >
              <Link to="/agent/encaissements?action=collecter">
                <Plus className="h-4 w-4" />
                Nouvelle collecte
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/agent/encaissements?action=scan">
                <QrCode className="h-4 w-4" />
                Scanner un QR
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {!profil?.compte_active && (
        <Alert variant="warning" title="Compte en attente d'activation">
          Certaines actions d'encaissement peuvent être bloquées jusqu'à l'activation de votre compte
          par le fournisseur.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Montant collecté"
          value={formatMoney(stats.montantCollecte)}
          hint={`${stats.mesRecouvrements} encaissement(s) confirmé(s) par vous`}
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="À confirmer"
          value={stats.enAttente}
          hint={`${formatMoney(stats.montantEnAttente)} en attente de confirmation`}
          icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Décaissements à confirmer"
          value={stats.decaissementsAConfirmer}
          hint="Demandes en attente de votre validation"
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Encaissements confirmés"
          value={stats.confirmes}
          hint={`${formatMoney(stats.montantConfirme)} sur votre périmètre`}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Clients actifs"
          value={stats.clientsActifs}
          hint={`${clientItems.length} client(s) au total`}
          icon={<Users className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Transactions"
          value={transactionItems.length}
          hint="Mouvements financiers liés à votre profil"
          icon={<ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}
          tone="neutral"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Collectes des 7 derniers jours</h2>
              <p className="mt-0.5 text-sm text-muted">
                Montants confirmés sur votre périmètre, toutes zones confondues.
              </p>
            </div>
            <Badge tone="brand" className="w-fit">
              {formatMoney(series.reduce((total, item) => total + item.montant, 0))}
            </Badge>
          </div>

          <div className="mt-5 h-72 w-full">
            {series.every((item) => item.montant === 0) ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                  <ScanLine className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-2 text-sm font-medium text-ink">Aucune collecte confirmée</p>
                <p className="mt-1 max-w-xs text-xs text-muted">
                  Le graphique s'anime dès que des encaissements sont confirmés.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="agentCollection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f7d5b" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#2f7d5b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
                  <XAxis
                    dataKey="jour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#68756e", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#68756e", fontSize: 11 }}
                    tickFormatter={(value: number) => compactNumber.format(value)}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ stroke: "#2f7d5b", strokeDasharray: "3 3" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5ebe7",
                      boxShadow: "0 8px 24px rgba(12, 59, 46, 0.08)",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#17211d", fontWeight: 600 }}
                    formatter={(value) => [formatMoney(Number(value)), "Montant"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="montant"
                    stroke="#2f7d5b"
                    strokeWidth={2.5}
                    fill="url(#agentCollection)"
                    activeDot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Activité récente</h2>
              <p className="mt-0.5 text-sm text-muted">Derniers mouvements de votre fournisseur.</p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Aucune activité"
                description="Les encaissements et décaissements apparaîtront ici."
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-1">
              {activity.map((item) => {
                const isEncaissement = item.id.startsWith("encaissement");

                return (
                  <li key={item.id}>
                    <Link
                      to={item.href}
                      className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface"
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          isEncaissement
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600",
                        )}
                      >
                        {isEncaissement ? (
                          <Wallet className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Banknote className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {item.description}
                        </span>
                        <span className="block text-xs text-muted">
                          {item.title} · {formatRelativeDate(item.date)}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-ink">
                        {formatMoney(item.montant)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
            <Link to="/agent/encaissements">
              Voir les encaissements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Mes dernières transactions</h2>
              <p className="mt-0.5 text-sm text-muted">Mouvements liés à votre profil agent.</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/agent/transactions">
                Tout voir
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucune transaction"
                description="Vos transactions apparaîtront après votre première collecte."
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
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTransactions.map((transaction) => {
                    const transactionStatus = TRANSACTION_AGENT_STATUS[transaction.statut];

                    return (
                      <tr key={transaction.id} className="transition-colors hover:bg-surface/60">
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                          {transaction.reference}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{transaction.client_nom}</p>
                          <p className="text-xs text-muted">{transaction.type_transaction_display}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-semibold text-ink">
                          {formatMoney(transaction.montant)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={transactionStatus.tone}>{transactionStatus.label}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">
                          {formatRelativeDate(transaction.date_creation)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-ink">Actions rapides</h2>
            <p className="mt-0.5 text-sm text-muted">Les gestes essentiels de votre journée.</p>
          </div>
          <div className="mt-4 grid gap-2">
            <QuickAction
              to="/agent/encaissements?action=collecter"
              label="Collecter un encaissement"
              hint="Enregistrer un paiement client"
              icon={Plus}
            />
            <QuickAction
              to="/agent/encaissements?action=scan"
              label="Scanner un QR code"
              hint="Confirmer avec le code client"
              icon={QrCode}
            />
            <QuickAction
              to="/agent/decaissements"
              label="Décaissements"
              hint={`${stats.decaissementsAConfirmer} demande(s) à confirmer`}
              icon={Banknote}
            />
            <QuickAction
              to="/agent/clients"
              label="Clients"
              hint="Consulter les soldes et comptes"
              icon={Users}
            />
            <QuickAction
              to="/agent/transactions"
              label="Transactions"
              hint="Suivre vos mouvements financiers"
              icon={ArrowLeftRight}
            />
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs font-medium text-ink">Rappel</p>
            <p className="mt-1 text-xs text-muted">
              La création de clients, l'attribution de solde et les décisions finales sur les
              décaissements sont réservées au fournisseur.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
