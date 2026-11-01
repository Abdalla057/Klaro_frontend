import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  QrCode,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getAllClients } from "../../../services/clientService";
import {
  confirmerEncaissement,
  getAllEncaissements,
} from "../../../services/encaissementService";
import { getApiError } from "../../../services/apiError";
import type {
  Client,
  Encaissement,
  EncaissementStatut,
} from "../../../types/fournisseur";
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
import { CollecteEncaissementModal } from "../components/CollecteEncaissementModal";
import { ConfirmationQrModal } from "../components/ConfirmationQrModal";
import { EncaissementDetailModal } from "../components/EncaissementDetailModal";
import { ENCAISSEMENT_AGENT_STATUS } from "../lib/status";

const PAGE_SIZE = 10;
type StatutFilter = "TOUS" | EncaissementStatut;

export function EncaissementsAgentPage() {
  const encaissements = useAllPages(getAllEncaissements);
  const clients = useAllPages(getAllClients);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatutFilter>("TOUS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<Encaissement | null>(null);
  const [confirming, setConfirming] = useState<Encaissement | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [collectOpen, setCollectOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const action = searchParams.get("action");
  const collectVisible = collectOpen || action === "collecter";
  const qrVisible = qrOpen || action === "scan";

  const items = useMemo(() => encaissements.data?.items ?? [], [encaissements.data]);
  const clientItems = useMemo(() => clients.data?.items ?? [], [clients.data]);
  const clientMap = useMemo(
    () => new Map<number, Client>(clientItems.map((client) => [client.id, client])),
    [clientItems],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const reference = term.replace(/^#/, "");

    return items.filter((encaissement) => {
      if (status !== "TOUS" && encaissement.statut !== status) return false;

      const date = toDateInputValue(encaissement.date_creation);
      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;

      if (!term) return true;

      const client = clientMap.get(encaissement.client);
      const clientName = client ? `${client.prenom} ${client.nom}`.toLowerCase() : "";
      return (
        String(encaissement.id).includes(reference) ||
        clientName.includes(term) ||
        (client?.telephone.toLowerCase().includes(term) ?? false)
      );
    });
  }, [items, status, dateFrom, dateTo, search, clientMap]);

  const summary = useMemo(() => {
    const pending = items.filter((item) => item.statut === "EN_ATTENTE");
    const confirmed = items.filter((item) => item.statut === "CONFIRME");

    return {
      total: items.length,
      pending: pending.length,
      pendingAmount: pending.reduce((total, item) => total + Number(item.montant), 0),
      confirmed: confirmed.length,
      confirmedAmount: confirmed.reduce((total, item) => total + Number(item.montant), 0),
    };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearAction = () => {
    if (!action) return;
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
  };

  const closeCollect = () => {
    setCollectOpen(false);
    clearAction();
  };

  const closeQr = () => {
    setQrOpen(false);
    clearAction();
  };

  const refreshAll = () => {
    encaissements.refetch();
    clients.refetch();
  };

  const handleConfirm = async () => {
    if (!confirming) return;

    setConfirmLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await confirmerEncaissement(confirming.id);
      setSuccess(`L'encaissement #${confirming.id} a été confirmé.`);
      encaissements.refetch();
      clients.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setConfirmLoading(false);
      setConfirming(null);
    }
  };

  const handleCollectionSuccess = (encaissement: Encaissement) => {
    setSuccess(`L'encaissement #${encaissement.id} a été collecté et confirmé.`);
    setActionError(null);
    closeCollect();
    refreshAll();
  };

  const handleQrSuccess = (encaissement: Encaissement) => {
    setSuccess(`L'encaissement #${encaissement.id} a été confirmé par QR code.`);
    setActionError(null);
    refreshAll();
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("TOUS");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  if (encaissements.loading || clients.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Encaissements"
          description="Confirmez les paiements en attente ou collectez un encaissement sur le terrain."
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

  if (encaissements.error || clients.error) {
    return (
      <ErrorState
        message={encaissements.error ?? clients.error ?? "Erreur de chargement."}
        onRetry={refreshAll}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encaissements"
        description="Confirmez les paiements en attente ou collectez un encaissement sur le terrain."
        actions={
          <>
            <Button type="button" variant="outline" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button type="button" variant="outline" onClick={() => setQrOpen(true)}>
              <QrCode className="h-4 w-4" />
              Scanner un QR
            </Button>
            <Button
              type="button"
              className="bg-brand text-white hover:bg-brand-dark"
              onClick={() => setCollectOpen(true)}
            >
              <Wallet className="h-4 w-4" />
              Collecter
            </Button>
          </>
        }
      />

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Encaissements</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Wallet className="h-4 w-4" aria-hidden="true" />
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
            {formatMoney(summary.pendingAmount)} en attente
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-emerald-700">Confirmés</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{summary.confirmed}</p>
          <p className="mt-1 text-xs text-emerald-700">Paiements confirmés</p>
        </div>
        <div className="rounded-2xl border border-border bg-brand p-5 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-white/65">Montant confirmé</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(summary.confirmedAmount)}</p>
          <p className="mt-1 text-xs text-white/55">Cumul des encaissements confirmés</p>
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
                placeholder="Rechercher par client, téléphone ou n°"
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatutFilter);
                setPage(1);
              }}
              className="lg:w-44"
              aria-label="Filtrer par statut"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">À confirmer</option>
              <option value="CONFIRME">Confirmés</option>
              <option value="ANNULE">Annulés</option>
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
              title="Aucun encaissement trouvé"
              description={
                items.length === 0
                  ? "Aucun encaissement n'est encore disponible sur votre réseau."
                  : "Aucun encaissement ne correspond à vos filtres."
              }
              action={
                items.length > 0 ? (
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="bg-brand text-white hover:bg-brand-dark"
                    onClick={() => setCollectOpen(true)}
                  >
                    <Wallet className="h-4 w-4" />
                    Collecter un encaissement
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
                    <th className="px-5 py-3 font-medium">Encaissement</th>
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium">Confirmation</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((encaissement) => {
                    const client = clientMap.get(encaissement.client);
                    const statusConfig = ENCAISSEMENT_AGENT_STATUS[encaissement.statut];

                    return (
                      <tr key={encaissement.id} className="transition-colors hover:bg-surface/60">
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">#{encaissement.id}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDate(encaissement.date_creation, true)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-ink">
                            {client ? `${client.prenom} ${client.nom}` : `Client #${encaissement.client}`}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">{client?.telephone ?? "—"}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatMoney(encaissement.montant)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-muted">
                            {encaissement.date_confirmation
                              ? formatDate(encaissement.date_confirmation, true)
                              : "En attente"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setViewing(encaissement)}
                            >
                              <Eye className="h-4 w-4" />
                              Détail
                            </Button>
                            {encaissement.statut === "EN_ATTENTE" && (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-brand text-white hover:bg-brand-dark"
                                onClick={() => setConfirming(encaissement)}
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
              itemLabel="encaissements"
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <EncaissementDetailModal
        encaissement={viewing}
        client={viewing ? clientMap.get(viewing.client) : undefined}
        onClose={() => setViewing(null)}
        onConfirm={(encaissement) => setConfirming(encaissement)}
      />

      {collectVisible && (
        <CollecteEncaissementModal
          open
          clients={clientItems}
          onClose={closeCollect}
          onSuccess={handleCollectionSuccess}
        />
      )}

      <ConfirmationQrModal
        open={qrVisible}
        onClose={closeQr}
        onSuccess={handleQrSuccess}
      />

      <ConfirmDialog
        open={!!confirming}
        title="Confirmer l'encaissement"
        description={
          confirming
            ? `Confirmer le paiement #${confirming.id} de ${formatMoney(
                confirming.montant,
              )} ? Cette action met à jour le solde du client.`
            : ""
        }
        confirmLabel="Confirmer"
        tone="default"
        loading={confirmLoading}
        onConfirm={handleConfirm}
        onClose={() => setConfirming(null)}
      />
    </div>
  );
}
