import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Eye, RefreshCw, Search, Wallet } from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import {
  annulerEncaissement,
  getAllEncaissements,
} from "../../../services/encaissementService";
import { getAllClients } from "../../../services/clientService";
import { getAllAgents } from "../../../services/agentService";
import { getApiError } from "../../../services/apiError";
import type { Encaissement, EncaissementStatut } from "../../../types/fournisseur";
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
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate, formatMoney, toDateInputValue } from "../lib/format";
import { ENCAISSEMENT_STATUS } from "../lib/status";

const PAGE_SIZE = 12;

type StatutFilter = "TOUS" | EncaissementStatut;

export function EncaissementsPage() {
  const encaissements = useAllPages(getAllEncaissements);
  const clients = useAllPages(getAllClients);
  const agents = useAllPages(getAllAgents);
  const {
    abonnement,
    loading: profilLoading,
    error: profilError,
    refresh,
  } = useFournisseur();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatutFilter>("TOUS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Encaissement | null>(null);
  const [cancelling, setCancelling] = useState<Encaissement | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const items = useMemo(() => encaissements.data?.items ?? [], [encaissements.data]);
  const clientMap = useMemo(
    () => new Map((clients.data?.items ?? []).map((client) => [client.id, client])),
    [clients.data],
  );
  const agentMap = useMemo(
    () => new Map((agents.data?.items ?? []).map((item) => [item.id, item])),
    [agents.data],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const reference = term.replace(/^#/, "");

    return items.filter((encaissement) => {
      if (status !== "TOUS" && encaissement.statut !== status) return false;

      const date = toDateInputValue(encaissement.date_creation);
      if (dateFrom && date < dateFrom) return false;
      if (dateTo && date > dateTo) return false;

      if (term) {
        const clientPhone = clientMap.get(encaissement.client)?.telephone.toLowerCase() ?? "";
        if (!String(encaissement.id).includes(reference) && !clientPhone.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [items, status, dateFrom, dateTo, search, clientMap]);

  const enAttente = useMemo(
    () => items.filter((item) => item.statut === "EN_ATTENTE").length,
    [items],
  );
  const confirmes = useMemo(
    () => items.filter((item) => item.statut === "CONFIRME").length,
    [items],
  );
  const annules = useMemo(
    () => items.filter((item) => item.statut === "ANNULE").length,
    [items],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? null;
  const canWrite = Boolean(abonnement?.est_actif);

  const updateFilter = (updater: () => void) => {
    updater();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("TOUS");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleCancel = async () => {
    if (!cancelling) return;

    setCancelLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await annulerEncaissement(cancelling.id);
      setSuccess(`L'encaissement #${cancelling.id} a été annulé.`);
      encaissements.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setCancelLoading(false);
      setCancelling(null);
    }
  };

  if (encaissements.loading || clients.loading || agents.loading || profilLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Encaissements
          </h1>
          <p className="mt-1 text-sm text-muted">
            Consultez les encaissements de vos clients et annulez ceux en attente.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={7} columns={6} />
        </div>
      </div>
    );
  }

  const error = encaissements.error ?? clients.error ?? agents.error ?? profilError;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refresh();
          encaissements.refetch();
          clients.refetch();
          agents.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encaissements"
        description="Les encaissements sont initiés par vos clients et confirmés par vos agents."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              encaissements.refetch();
              clients.refetch();
              agents.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          Vous pouvez consulter les encaissements, mais l'annulation est désactivée.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-700">En attente</p>
          <p className="mt-0.5 text-xl font-semibold text-amber-800">{enAttente}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium text-emerald-700">Confirmés</p>
          <p className="mt-0.5 text-xl font-semibold text-emerald-800">{confirmes}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-700">Annulés</p>
          <p className="mt-0.5 text-xl font-semibold text-red-800">{annules}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="grid gap-3 border-b border-border px-4 py-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => updateFilter(() => setSearch(event.target.value))}
              placeholder="Référence ou téléphone du client..."
              className="pl-9"
              aria-label="Rechercher un encaissement"
            />
          </div>

          <Select
            value={status}
            onChange={(event) => updateFilter(() => setStatus(event.target.value as StatutFilter))}
            aria-label="Filtrer par statut"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRME">Confirmés</option>
            <option value="ANNULE">Annulés</option>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => updateFilter(() => setDateFrom(event.target.value))}
            aria-label="Date de début"
            title="Date de début"
          />

          <Input
            type="date"
            value={dateTo}
            onChange={(event) => updateFilter(() => setDateTo(event.target.value))}
            aria-label="Date de fin"
            title="Date de fin"
          />

          <Button type="button" variant="outline" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-5">
            {items.length === 0 ? (
              <EmptyState
                title="Aucun encaissement"
                description="Les encaissements initiés par vos clients apparaîtront ici."
                icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
              />
            ) : (
              <EmptyState
                title="Aucun résultat"
                description="Aucun encaissement ne correspond à vos filtres."
                icon={<Search className="h-5 w-5" aria-hidden="true" />}
                action={
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                }
              />
            )}
          </div>
        ) : (
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
                {pageItems.map((encaissement) => {
                  const statut = ENCAISSEMENT_STATUS[encaissement.statut];
                  const client = clientMap.get(encaissement.client);
                  const agentPhone =
                    encaissement.agent === null
                      ? "—"
                      : (() => {
                          const linkedAgent = agentMap.get(encaissement.agent);
                          if (!linkedAgent) return `Agent #${encaissement.agent}`;
                          const fullName = [linkedAgent.prenom, linkedAgent.nom]
                            .filter(Boolean)
                            .join(" ");
                          return fullName || linkedAgent.telephone;
                        })();

                  return (
                    <tr key={encaissement.id} className="transition-colors hover:bg-surface/60">
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        #{encaissement.id}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">
                          {client?.telephone ?? `Client #${encaissement.client}`}
                        </p>
                        {client?.adresse && (
                          <p className="truncate text-xs text-muted">{client.adresse}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">{agentPhone}</td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        {formatMoney(encaissement.montant, devise)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(encaissement.date_creation, true)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={statut.tone}>{statut.label}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Voir l'encaissement"
                            title="Voir l'encaissement"
                            onClick={() => setViewing(encaissement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {encaissement.statut === "EN_ATTENTE" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Annuler l'encaissement"
                              title={
                                canWrite
                                  ? "Annuler l'encaissement"
                                  : "Abonnement inactif : annulation désactivée"
                              }
                              disabled={!canWrite}
                              onClick={() => setCancelling(encaissement)}
                            >
                              <Ban className="h-4 w-4 text-red-500" />
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
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="encaissements"
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Détails de l'encaissement"
        description={viewing ? `Référence #${viewing.id}` : undefined}
        size="lg"
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Badge tone={ENCAISSEMENT_STATUS[viewing.statut].tone}>
                {ENCAISSEMENT_STATUS[viewing.statut].label}
              </Badge>
              <p className="text-2xl font-semibold tracking-tight text-ink">
                {formatMoney(viewing.montant, devise)}
              </p>
            </div>

            <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Client</dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {clientMap.get(viewing.client)?.telephone ?? `Client #${viewing.client}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Agent</dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {viewing.agent === null
                    ? "Non confirmé"
                    : (() => {
                        const linkedAgent = agentMap.get(viewing.agent);
                        if (!linkedAgent) return `Agent #${viewing.agent}`;
                        const fullName = [linkedAgent.prenom, linkedAgent.nom]
                          .filter(Boolean)
                          .join(" ");
                        return fullName || linkedAgent.telephone;
                      })()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Date de création
                </dt>
                <dd className="mt-1 text-sm text-ink">
                  {formatDate(viewing.date_creation, true)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Date de confirmation
                </dt>
                <dd className="mt-1 text-sm text-ink">
                  {viewing.date_confirmation
                    ? formatDate(viewing.date_confirmation, true)
                    : "Non confirmé"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  Commentaire
                </dt>
                <dd className="mt-1 text-sm text-ink">
                  {viewing.commentaire || "Aucun commentaire"}
                </dd>
              </div>
            </dl>

            {viewing.statut === "EN_ATTENTE" && (
              <div className="flex justify-end border-t border-border pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!canWrite}
                  onClick={() => {
                    setViewing(null);
                    setCancelling(viewing);
                  }}
                >
                  <Ban className="h-4 w-4" />
                  Annuler l'encaissement
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelling)}
        title="Annuler l'encaissement"
        description={`Voulez-vous vraiment annuler l'encaissement #${cancelling?.id ?? ""} d'un montant de ${formatMoney(cancelling?.montant, devise)} ? Cette action est irréversible.`}
        confirmLabel="Annuler l'encaissement"
        loading={cancelLoading}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}
