import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  Hourglass,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import {
  confirmerDecaissement,
  getAllDecaissements,
} from "../../../services/financeService";
import { getApiError } from "../../../services/apiError";
import type { DecaissementStatut, DemandeDecaissement } from "../../../types/fournisseur";
import { formatDate, formatMoney, toDateInputValue } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { Input } from "../../../shared/ui/input";
import { TableSkeleton } from "../../../shared/ui/loading";
import { PageHeader } from "../../../shared/ui/page-header";
import { Pagination } from "../../../shared/ui/pagination";
import { Select } from "../../../shared/ui/select";
import { DecaissementDetailModal } from "../components/DecaissementDetailModal";
import { DECAISSEMENT_AGENT_STATUS } from "../lib/status";

const PAGE_SIZE = 10;
type StatutFilter = "TOUS" | DecaissementStatut;

export function DecaissementsAgentPage() {
  const decaissements = useAllPages(getAllDecaissements);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatutFilter>("TOUS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<DemandeDecaissement | null>(null);
  const [confirming, setConfirming] = useState<DemandeDecaissement | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = useMemo(() => decaissements.data?.items ?? [], [decaissements.data]);

  const summary = useMemo(() => {
    const pending = items.filter((item) => item.statut === "EN_ATTENTE");
    const waitingValidation = items.filter(
      (item) => item.statut === "CONFIRMATION_AGENT" || item.statut === "EN_ATTENTE_VALIDATION",
    );
    const paid = items.filter((item) => item.statut === "PAYE");

    return {
      total: items.length,
      pending: pending.length,
      pendingAmount: pending.reduce((total, item) => total + Number(item.montant), 0),
      waitingValidation: waitingValidation.length,
      paid: paid.length,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((demande) => {
      if (status !== "TOUS" && demande.statut !== status) return false;

      const date = toDateInputValue(demande.date_creation);
      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;

      if (!term) return true;

      return (
        demande.reference.toLowerCase().includes(term) ||
        demande.client_nom.toLowerCase().includes(term) ||
        demande.client_telephone.toLowerCase().includes(term) ||
        String(demande.id).includes(term.replace(/^#/, ""))
      );
    });
  }, [items, status, dateFrom, dateTo, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setStatus("TOUS");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleConfirm = async () => {
    if (!confirming) return;

    setConfirmLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await confirmerDecaissement(confirming.id);
      setSuccess(`La demande ${confirming.reference} a été confirmée.`);
      decaissements.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setConfirmLoading(false);
      setConfirming(null);
    }
  };

  if (decaissements.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Décaissements"
          description="Confirmez les demandes de retrait en attente pour votre fournisseur."
        />
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

  if (decaissements.error) {
    return <ErrorState message={decaissements.error} onRetry={decaissements.refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Décaissements"
        description="Confirmez les demandes de retrait en attente. La validation et le paiement sont gérés par le fournisseur."
        actions={
          <Button type="button" variant="outline" onClick={decaissements.refetch}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Demandes</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Banknote className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.total}</p>
          <p className="mt-1 text-xs text-muted">Accessibles sur votre réseau</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-amber-700">À confirmer</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-900">{summary.pending}</p>
          <p className="mt-1 text-xs text-amber-700">
            {formatMoney(summary.pendingAmount)} à traiter
          </p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-sky-700">En validation</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Hourglass className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-sky-900">
            {summary.waitingValidation}
          </p>
          <p className="mt-1 text-xs text-sky-700">En attente du fournisseur</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-emerald-700">Payées</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{summary.paid}</p>
          <p className="mt-1 text-xs text-emerald-700">Demandes finalisées</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-brand/10 bg-brand-soft/60 px-4 py-3 text-xs text-brand">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Votre rôle se limite à la confirmation des demandes. Vous ne pouvez ni approuver, ni
        payer, ni refuser une demande.
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
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
                placeholder="Référence, client ou téléphone"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatutFilter);
                setPage(1);
              }}
              className="lg:w-48"
              aria-label="Filtrer par statut"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">À confirmer</option>
              <option value="CONFIRMATION_AGENT">Confirmées par agent</option>
              <option value="EN_ATTENTE_VALIDATION">En validation</option>
              <option value="APPROUVE">Approuvées</option>
              <option value="PAYE">Payées</option>
              <option value="REFUSE">Refusées</option>
              <option value="ANNULE">Annulées</option>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              aria-label="Date de début"
              className="lg:w-40"
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
                className="flex-1 lg:w-40"
              />
              {(search || status !== "TOUS" || dateFrom || dateTo) && (
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
              title="Aucune demande trouvée"
              description={
                items.length === 0
                  ? "Aucune demande de décaissement n'est disponible pour le moment."
                  : "Aucune demande ne correspond à vos filtres."
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
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Confirmation agent</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((demande) => {
                    const statusConfig = DECAISSEMENT_AGENT_STATUS[demande.statut];

                    return (
                      <tr key={demande.id} className="transition-colors hover:bg-surface/60">
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{demande.reference}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDate(demande.date_creation, true)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{demande.client_nom}</p>
                          <p className="mt-0.5 text-xs text-muted">{demande.client_telephone}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatMoney(demande.montant)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {formatDate(demande.date_confirmation_agent, true)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setViewing(demande)}
                            >
                              <Eye className="h-4 w-4" />
                              Détail
                            </Button>
                            {demande.statut === "EN_ATTENTE" && (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-brand text-white hover:bg-brand-dark"
                                onClick={() => setConfirming(demande)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Confirmer
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
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="demandes"
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <DecaissementDetailModal
        demande={viewing}
        onClose={() => setViewing(null)}
        onConfirm={(demande) => setConfirming(demande)}
      />

      <ConfirmDialog
        open={!!confirming}
        title="Confirmer la demande"
        description={
          confirming
            ? `Confirmer la demande ${confirming.reference} de ${formatMoney(
                confirming.montant,
              )} pour ${confirming.client_nom} ?`
            : ""
        }
        confirmLabel="Confirmer la demande"
        tone="default"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onClose={() => setConfirming(null)}
      />
    </div>
  );
}
