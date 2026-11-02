import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getAllTransactions } from "../../../services/financeService";
import type {
  TransactionFinanciere,
  TransactionSens,
  TransactionStatut,
  TransactionType,
} from "../../../types/fournisseur";
import { formatDate, formatMoney, toDateInputValue } from "../../../shared/utils/format";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { Input } from "../../../shared/ui/input";
import { TableSkeleton } from "../../../shared/ui/loading";
import { PageHeader } from "../../../shared/ui/page-header";
import { Pagination } from "../../../shared/ui/pagination";
import { Select } from "../../../shared/ui/select";
import { ClientTransactionDetailModal } from "../components/ClientTransactionDetailModal";
import {
  TRANSACTION_CLIENT_SENS_LABELS,
  TRANSACTION_CLIENT_STATUS,
  TRANSACTION_CLIENT_TYPE_LABELS,
} from "../lib/status";

const PAGE_SIZE = 12;

type TypeFilter = "TOUS" | TransactionType;
type SensFilter = "TOUS" | TransactionSens;
type StatutFilter = "TOUS" | TransactionStatut;

export function TransactionsClientPage() {
  const transactions = useAllPages(getAllTransactions);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("TOUS");
  const [sens, setSens] = useState<SensFilter>("TOUS");
  const [status, setStatus] = useState<StatutFilter>("TOUS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<TransactionFinanciere | null>(null);

  const items = useMemo(() => transactions.data?.items ?? [], [transactions.data]);

  const summary = useMemo(() => {
    const validees = items.filter((item) => item.statut === "VALIDEE");
    const debits = validees.filter((item) => item.sens === "DEBIT");
    const credits = validees.filter((item) => item.sens === "CREDIT");

    return {
      total: items.length,
      debits: debits.reduce((total, item) => total + Number(item.montant), 0),
      credits: credits.reduce((total, item) => total + Number(item.montant), 0),
      debitCount: debits.length,
      creditCount: credits.length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((transaction) => {
      if (type !== "TOUS" && transaction.type_transaction !== type) return false;
      if (sens !== "TOUS" && transaction.sens !== sens) return false;
      if (status !== "TOUS" && transaction.statut !== status) return false;

      const date = toDateInputValue(transaction.date_creation);
      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;

      if (!term) return true;

      return (
        transaction.reference.toLowerCase().includes(term) ||
        transaction.commentaire.toLowerCase().includes(term) ||
        String(transaction.id).includes(term.replace(/^#/, ""))
      );
    });
  }, [items, type, sens, status, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setType("TOUS");
    setSens("TOUS");
    setStatus("TOUS");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (transactions.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Historique des transactions"
          description="Retrouvez tous les mouvements financiers de votre compte."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-border bg-white"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={8} columns={6} />
        </div>
      </div>
    );
  }

  if (transactions.error) {
    return <ErrorState message={transactions.error} onRetry={transactions.refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historique des transactions"
        description="Crédits, débits, attributions et régularisations liés à votre compte. Lecture seule."
        actions={
          <Button type="button" variant="outline" onClick={transactions.refetch}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Transactions</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.total}</p>
          <p className="mt-1 text-xs text-muted">Mouvements enregistrés</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-red-700">Débits validés</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-900">{formatMoney(summary.debits)}</p>
          <p className="mt-1 text-xs text-red-700">{summary.debitCount} transaction(s)</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-emerald-700">Crédits validés</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">
            {formatMoney(summary.credits)}
          </p>
          <p className="mt-1 text-xs text-emerald-700">{summary.creditCount} transaction(s)</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_repeat(5,auto)]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Référence ou commentaire"
                className="pl-9"
              />
            </div>
            <Select
              value={type}
              onChange={(event) => {
                setType(event.target.value as TypeFilter);
                setPage(1);
              }}
              className="xl:w-44"
              aria-label="Filtrer par type"
            >
              <option value="TOUS">Tous les types</option>
              {Object.entries(TRANSACTION_CLIENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              value={sens}
              onChange={(event) => {
                setSens(event.target.value as SensFilter);
                setPage(1);
              }}
              className="xl:w-32"
              aria-label="Filtrer par sens"
            >
              <option value="TOUS">Tous sens</option>
              <option value="CREDIT">Crédit</option>
              <option value="DEBIT">Débit</option>
            </Select>
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatutFilter);
                setPage(1);
              }}
              className="xl:w-36"
              aria-label="Filtrer par statut"
            >
              <option value="TOUS">Tous statuts</option>
              <option value="VALIDEE">Validées</option>
              <option value="ANNULEE">Annulées</option>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              aria-label="Date de début"
              className="xl:w-40"
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                aria-label="Date de fin"
                className="flex-1 xl:w-40"
              />
              {(search ||
                type !== "TOUS" ||
                sens !== "TOUS" ||
                status !== "TOUS" ||
                dateFrom ||
                dateTo) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={resetFilters}
                  aria-label="Réinitialiser les filtres"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune transaction trouvée"
              description={
                items.length === 0
                  ? "Aucune transaction n'est encore liée à votre compte."
                  : "Aucune transaction ne correspond à vos filtres."
              }
              action={
                items.length > 0 ? (
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-medium">Référence</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Sens</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((transaction) => {
                    const statusConfig = TRANSACTION_CLIENT_STATUS[transaction.statut];

                    return (
                      <tr
                        key={transaction.id}
                        className="transition-colors hover:bg-surface/60"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{transaction.reference}</p>
                          <p className="mt-0.5 text-xs text-muted">#{transaction.id}</p>
                        </td>
                        <td className="px-5 py-4 text-ink">
                          {TRANSACTION_CLIENT_TYPE_LABELS[transaction.type_transaction]}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              transaction.sens === "DEBIT"
                                ? "inline-flex items-center gap-1 text-xs font-medium text-red-600"
                                : "inline-flex items-center gap-1 text-xs font-medium text-emerald-600"
                            }
                          >
                            {transaction.sens === "DEBIT" ? (
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {TRANSACTION_CLIENT_SENS_LABELS[transaction.sens]}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatMoney(transaction.montant)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {formatDate(transaction.date_creation, true)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setViewing(transaction)}
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
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="transactions"
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ClientTransactionDetailModal
        transaction={viewing}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}

export default TransactionsClientPage;
