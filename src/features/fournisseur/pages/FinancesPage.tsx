import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import {
  approuverDecaissement,
  getAllDecaissements,
  getAllTransactions,
  getStatistiquesFinancieres,
  payerDecaissement,
  refuserDecaissement,
} from "../../../services/financeService";
import type {
  DecaissementStatut,
  DemandeDecaissement,
  StatistiquesFinancieres,
} from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { Input } from "../../../shared/ui/input";
import { TableSkeleton } from "../../../shared/ui/loading";
import { Modal } from "../../../shared/ui/modal";
import { PageHeader } from "../../../shared/ui/page-header";
import { Pagination } from "../../../shared/ui/pagination";
import { Select } from "../../../shared/ui/select";
import { StatCard } from "../../../shared/ui/stat-card";
import { Textarea } from "../../../shared/ui/textarea";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate, formatMoney } from "../lib/format";
import {
  DECAISSEMENT_STATUS,
  TRANSACTION_TYPE_LABELS,
} from "../lib/status";

const PAGE_SIZE = 10;
const TERMINAL_STATUSES: DecaissementStatut[] = ["PAYE", "REFUSE", "ANNULE"];

type Tab = "decaissements" | "transactions";
type StatutFilter = "TOUS" | DecaissementStatut;

export function FinancesPage() {
  const transactions = useAllPages(getAllTransactions);
  const decaissements = useAllPages(getAllDecaissements);
  const { abonnement, loading: profilLoading, error: profilError, refresh } = useFournisseur();

  const [stats, setStats] = useState<StatistiquesFinancieres | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsKey, setStatsKey] = useState(0);

  const [tab, setTab] = useState<Tab>("decaissements");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatutFilter>("TOUS");
  const [page, setPage] = useState(1);

  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [paying, setPaying] = useState<DemandeDecaissement | null>(null);
  const [refusing, setRefusing] = useState<DemandeDecaissement | null>(null);
  const [refusMotif, setRefusMotif] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStatistiquesFinancieres()
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

  const decaissementItems = useMemo(
    () => decaissements.data?.items ?? [],
    [decaissements.data],
  );
  const transactionItems = useMemo(
    () => transactions.data?.items ?? [],
    [transactions.data],
  );
  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? null;
  const canWrite = Boolean(abonnement?.est_actif);

  const refreshAll = () => {
    decaissements.refetch();
    transactions.refetch();
    setStatsLoading(true);
    setStatsKey((key) => key + 1);
    refresh();
  };

  const filteredDecaissements = useMemo(() => {
    const term = search.trim().toLowerCase();

    return decaissementItems.filter((demande) => {
      if (status !== "TOUS" && demande.statut !== status) return false;
      if (!term) return true;

      return (
        String(demande.id).includes(term.replace(/^#/, "")) ||
        demande.reference.toLowerCase().includes(term) ||
        demande.client_nom.toLowerCase().includes(term) ||
        demande.client_telephone.toLowerCase().includes(term)
      );
    });
  }, [decaissementItems, search, status]);

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return transactionItems;

    return transactionItems.filter(
      (transaction) =>
        String(transaction.id).includes(term.replace(/^#/, "")) ||
        transaction.reference.toLowerCase().includes(term) ||
        transaction.client_nom.toLowerCase().includes(term) ||
        transaction.client_telephone.toLowerCase().includes(term) ||
        transaction.type_transaction_display.toLowerCase().includes(term),
    );
  }, [transactionItems, search]);

  const activeItems =
    tab === "decaissements" ? filteredDecaissements : filteredTransactions;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = activeItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("TOUS");
    setPage(1);
  };

  const changeTab = (nextTab: Tab) => {
    setTab(nextTab);
    setStatus("TOUS");
    setPage(1);
  };

  const handleApprove = async (demande: DemandeDecaissement) => {
    setActionError(null);
    setSuccess(null);
    setApprovingId(demande.id);

    try {
      await approuverDecaissement(demande.id);
      setSuccess(`La demande de ${demande.client_nom} a été approuvée.`);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setApprovingId(null);
    }
  };

  const handlePay = async () => {
    if (!paying) return;

    setActionLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await payerDecaissement(paying.id);
      setSuccess(`La demande de ${paying.client_nom} a été payée.`);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setActionLoading(false);
      setPaying(null);
    }
  };

  const handleRefuse = async () => {
    if (!refusing) return;

    if (!refusMotif.trim()) {
      setActionError("Le motif de refus est requis.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await refuserDecaissement(refusing.id, refusMotif.trim());
      setSuccess(`La demande de ${refusing.client_nom} a été refusée.`);
      setRefusMotif("");
      setRefusing(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const loading =
    profilLoading ||
    statsLoading ||
    decaissements.loading ||
    transactions.loading;
  const error =
    profilError ??
    statsError ??
    decaissements.error ??
    transactions.error;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Finances
          </h1>
          <p className="mt-1 text-sm text-muted">
            Suivez les mouvements financiers et les demandes de décaissement.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-border bg-white"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={7} columns={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshAll} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finances"
        description="Suivez le grand livre, les soldes clients et les demandes de décaissement."
        actions={
          <Button type="button" variant="outline" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          La consultation reste disponible, mais les décisions sur les décaissements sont
          désactivées.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Solde net"
          value={formatMoney(stats?.solde_net, devise)}
          hint={`${stats?.nombre_transactions ?? 0} transaction(s) validée(s)`}
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Total crédits"
          value={formatMoney(stats?.total_credits, devise)}
          hint="Attributions et régularisations créditrices"
          icon={<ArrowDownLeft className="h-4 w-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Total débits"
          value={formatMoney(stats?.total_debits, devise)}
          hint="Encaissements et décaissements payés"
          icon={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Décaissements en cours"
          value={stats?.decaissements_en_cours ?? 0}
          hint={formatMoney(stats?.montant_decaissements_en_cours, devise)}
          icon={<Clock className="h-4 w-4" aria-hidden="true" />}
          tone="danger"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 pt-4">
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-1">
            <button
              type="button"
              onClick={() => changeTab("decaissements")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === "decaissements"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Décaissements ({decaissementItems.length})
            </button>
            <button
              type="button"
              onClick={() => changeTab("transactions")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === "transactions"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              Transactions ({transactionItems.length})
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-b border-border px-4 py-4 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={
                tab === "decaissements"
                  ? "Référence, client ou téléphone..."
                  : "Référence, client, type..."
              }
              className="pl-9"
              aria-label="Rechercher"
            />
          </div>

          {tab === "decaissements" ? (
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatutFilter);
                setPage(1);
              }}
              aria-label="Filtrer par statut"
              className="sm:w-56"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente de l'agent</option>
              <option value="CONFIRMATION_AGENT">À approuver</option>
              <option value="EN_ATTENTE_VALIDATION">En attente de validation</option>
              <option value="APPROUVE">À payer</option>
              <option value="PAYE">Payés</option>
              <option value="REFUSE">Refusés</option>
              <option value="ANNULE">Annulés</option>
            </Select>
          ) : (
            <Button type="button" variant="outline" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>

        {pageItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={tab === "decaissements" ? "Aucun décaissement" : "Aucune transaction"}
              description={
                tab === "decaissements"
                  ? "Les demandes de retrait de vos clients apparaîtront ici."
                  : "Les mouvements financiers validés apparaîtront ici."
              }
              icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
              action={
                search || status !== "TOUS" ? (
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : tab === "decaissements" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Référence</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((item) => {
                  const demande = item as DemandeDecaissement;
                  const statut = DECAISSEMENT_STATUS[demande.statut];
                  const isTerminal = TERMINAL_STATUSES.includes(demande.statut);
                  const canApprove =
                    demande.statut === "CONFIRMATION_AGENT" ||
                    demande.statut === "EN_ATTENTE_VALIDATION";
                  const canPay = demande.statut === "APPROUVE";

                  return (
                    <tr
                      key={demande.id}
                      className="transition-colors hover:bg-surface/60"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        #{demande.id}
                        <p className="text-[11px] font-normal text-muted">
                          {demande.reference.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{demande.client_nom}</p>
                        <p className="text-xs text-muted">{demande.client_telephone}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {demande.agent_nom ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        {formatMoney(demande.montant, devise)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(demande.date_creation, true)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={statut.tone}>{statut.label}</Badge>
                        {demande.motif_refus && (
                          <p className="mt-1 max-w-48 truncate text-xs text-muted">
                            {demande.motif_refus}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canApprove && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite || approvingId === demande.id}
                              onClick={() => handleApprove(demande)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {approvingId === demande.id ? "..." : "Approuver"}
                            </Button>
                          )}
                          {canPay && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => setPaying(demande)}
                            >
                              <Banknote className="h-4 w-4" />
                              Payer
                            </Button>
                          )}
                          {!isTerminal && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => {
                                setRefusMotif("");
                                setRefusing(demande);
                              }}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                              Refuser
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Référence</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Sens</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((item) => {
                  const transaction = item as (typeof transactionItems)[number];
                  const credit = transaction.sens === "CREDIT";

                  return (
                    <tr
                      key={transaction.id}
                      className="transition-colors hover:bg-surface/60"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        #{transaction.id}
                        <p className="text-[11px] font-normal text-muted">
                          {transaction.reference.slice(0, 8)}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {TRANSACTION_TYPE_LABELS[transaction.type_transaction]}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{transaction.client_nom}</p>
                        <p className="text-xs text-muted">{transaction.client_telephone}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={credit ? "success" : "warning"}>
                          {transaction.sens_display}
                        </Badge>
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-3 font-medium ${
                          credit ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {credit ? "+" : "−"}
                        {formatMoney(transaction.montant, devise)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(transaction.date_creation, true)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={transaction.statut === "VALIDEE" ? "success" : "neutral"}>
                          {transaction.statut_display}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={activeItems.length}
          pageSize={PAGE_SIZE}
          itemLabel={tab === "decaissements" ? "décaissements" : "transactions"}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={Boolean(paying)}
        title="Payer le décaissement"
        description={`Confirmer le paiement de ${formatMoney(paying?.montant, devise)} à ${paying?.client_nom ?? "ce client"} ? Le solde du client sera débité immédiatement.`}
        confirmLabel="Confirmer le paiement"
        loading={actionLoading}
        onConfirm={handlePay}
        onClose={() => setPaying(null)}
      />

      <Modal
        open={Boolean(refusing)}
        onClose={() => setRefusing(null)}
        title="Refuser la demande"
        description={
          refusing
            ? `${refusing.client_nom} · ${formatMoney(refusing.montant, devise)}`
            : undefined
        }
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="motif-refus" className="block text-sm font-medium text-ink">
              Motif du refus
            </label>
            <Textarea
              id="motif-refus"
              value={refusMotif}
              onChange={(event) => setRefusMotif(event.target.value)}
              placeholder="Expliquez la raison du refus..."
              className="mt-1 min-h-24"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRefusing(null)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRefuse}
              disabled={actionLoading || !refusMotif.trim()}
            >
              <XCircle className="h-4 w-4" />
              {actionLoading ? "Refus..." : "Refuser la demande"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
