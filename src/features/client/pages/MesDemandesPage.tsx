import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { annulerDecaissement, getAllDecaissements } from "../../../services/financeService";
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
import { useClient } from "../context/clientContextCore";
import { ClientDemandeDetailModal } from "../components/ClientDemandeDetailModal";
import { DEMANDE_CLIENT_STATUS, peutAnnulerDemande } from "../lib/status";

const PAGE_SIZE = 10;
type StatutFilter = "TOUS" | DecaissementStatut;

export function MesDemandesPage() {
  const decaissements = useAllPages(getAllDecaissements);
  const { refresh } = useClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatutFilter>("TOUS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<DemandeDecaissement | null>(null);
  const [annulation, setAnnulation] = useState<DemandeDecaissement | null>(null);
  const [annulationLoading, setAnnulationLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const items = useMemo(() => decaissements.data?.items ?? [], [decaissements.data]);

  const summary = useMemo(
    () => ({
      total: items.length,
      enAttente: items.filter((item) => item.statut === "EN_ATTENTE").length,
      confirmees: items.filter((item) => item.statut === "CONFIRMATION_AGENT").length,
      approuvees: items.filter((item) => item.statut === "APPROUVE").length,
      payees: items.filter((item) => item.statut === "PAYE").length,
    }),
    [items],
  );

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
        String(demande.id).includes(term.replace(/^#/, "")) ||
        demande.commentaire.toLowerCase().includes(term)
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

  const handleAnnuler = async () => {
    if (!annulation) return;

    setAnnulationLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await annulerDecaissement(annulation.id);
      setSuccess(`La demande ${annulation.reference} a été annulée.`);
      decaissements.refetch();
      refresh();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setAnnulationLoading(false);
      setAnnulation(null);
    }
  };

  if (decaissements.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mes demandes"
          description="Suivez l'état de vos demandes de décaissement."
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
          <TableSkeleton rows={7} columns={5} />
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
        title="Mes demandes"
        description="Retrouvez toutes vos demandes de décaissement et leur statut."
        actions={
          <>
            <Button type="button" variant="outline" onClick={decaissements.refetch}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button asChild className="bg-brand text-white hover:bg-brand-dark">
              <Link to="/client/demandes/nouvelle">
                <Plus className="h-4 w-4" />
                Nouvelle demande
              </Link>
            </Button>
          </>
        }
      />

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">En attente</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.enAttente}</p>
          <p className="mt-1 text-xs text-muted">En attente de confirmation agent</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Confirmées agent</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Banknote className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.confirmees}</p>
          <p className="mt-1 text-xs text-muted">En attente de décision fournisseur</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Approuvées</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.approuvees}</p>
          <p className="mt-1 text-xs text-muted">En attente de paiement</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Payées</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.payees}</p>
          <p className="mt-1 text-xs text-muted">Sur {summary.total} demande(s)</p>
        </div>
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
                placeholder="Référence ou commentaire"
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
              {Object.entries(DEMANDE_CLIENT_STATUS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
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
                  ? "Vous n'avez pas encore soumis de demande de décaissement."
                  : "Aucune demande ne correspond à vos filtres."
              }
              action={
                items.length === 0 ? (
                  <Button asChild className="bg-brand text-white hover:bg-brand-dark">
                    <Link to="/client/demandes/nouvelle">
                      <Plus className="h-4 w-4" />
                      Demander un décaissement
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                )
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
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Créée le</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((demande) => {
                    const statusConfig = DEMANDE_CLIENT_STATUS[demande.statut];

                    return (
                      <tr key={demande.id} className="transition-colors hover:bg-surface/60">
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">{demande.reference}</p>
                          <p className="mt-0.5 text-xs text-muted">#{demande.id}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatMoney(demande.montant)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">
                          {formatDate(demande.date_creation, true)}
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
                            {peutAnnulerDemande(demande.statut) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => setAnnulation(demande)}
                              >
                                <Ban className="h-4 w-4" />
                                Annuler
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

      <ClientDemandeDetailModal
        demande={viewing}
        onClose={() => setViewing(null)}
        onAnnuler={(demande) => setAnnulation(demande)}
      />

      <ConfirmDialog
        open={!!annulation}
        title="Annuler la demande"
        description={
          annulation
            ? `Annuler la demande ${annulation.reference} de ${formatMoney(
                annulation.montant,
              )} ? Le montant sera libéré sur votre solde disponible.`
            : ""
        }
        confirmLabel="Annuler la demande"
        cancelLabel="Conserver"
        loading={annulationLoading}
        onConfirm={handleAnnuler}
        onClose={() => setAnnulation(null)}
      />
    </div>
  );
}

export default MesDemandesPage;
