import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import {
  deleteClient,
  getAllClients,
  resendClientCode,
} from "../../../services/clientService";
import { getApiError } from "../../../services/apiError";
import type { Client } from "../../../types/fournisseur";
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
import { useFournisseur } from "../context/fournisseurContextCore";
import { ActivationCodeModal } from "../components/ActivationCodeModal";
import { ClientCreateModal } from "../components/ClientCreateModal";
import { ClientEditModal } from "../components/ClientEditModal";
import { SoldeAttributionModal } from "../components/SoldeAttributionModal";
import { SoldeCorrectionModal } from "../components/SoldeCorrectionModal";
import { formatDate, formatMoney } from "../lib/format";
import { compteStatus } from "../lib/status";

const PAGE_SIZE = 10;

type ActivationCode = {
  telephone: string;
  code: string | null;
};

export function ClientsPage() {
  const clients = useAllPages(getAllClients);
  const {
    abonnement,
    loading: profilLoading,
    error: profilError,
    refresh,
  } = useFournisseur();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Client | null>(null);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [soldeClient, setSoldeClient] = useState<Client | null>(null);
  const [correctionClient, setCorrectionClient] = useState<Client | null>(null);
  const [activation, setActivation] = useState<ActivationCode | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createOpen = searchParams.get("action") === "create";

  const openCreate = () => {
    const next = new URLSearchParams(searchParams);
    next.set("action", "create");
    setSearchParams(next);
  };

  const closeCreate = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("action");
    setSearchParams(next, { replace: true });
  };

  const items = useMemo(() => clients.data?.items ?? [], [clients.data]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((client) => {
      const nom = (client.nom ?? "").toLowerCase();
      const prenom = (client.prenom ?? "").toLowerCase();
      const telephone = client.telephone.toLowerCase();
      const adresse = (client.adresse ?? "").toLowerCase();
      return (
        nom.includes(term) ||
        prenom.includes(term) ||
        `${prenom} ${nom}`.trim().includes(term) ||
        telephone.includes(term) ||
        adresse.includes(term)
      );
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const canWrite = Boolean(abonnement?.est_actif);
  const canCreate = Boolean(canWrite && abonnement?.peut_creer_client);
  const clientsUsed = abonnement?.utilisation?.clients ?? clients.data?.count ?? 0;
  const clientsMax = abonnement?.quotas?.clients ?? null;
  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? null;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleResend = async (client: Client) => {
    setActionError(null);
    setSuccess(null);
    setResendingId(client.id);

    try {
      const response = await resendClientCode(client.telephone);
      setActivation({ telephone: client.telephone, code: response.code_activation });
      setSuccess(`Un nouveau code d'activation a été généré pour ${client.telephone}.`);
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    setDeleteLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await deleteClient(deleting.id);
      setSuccess(`Le client ${deleting.telephone} a été supprimé.`);
      clients.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setDeleteLoading(false);
      setDeleting(null);
    }
  };

  if (clients.loading || profilLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Mes clients</h1>
          <p className="mt-1 text-sm text-muted">Gérez les comptes de vos clients.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={6} columns={5} />
        </div>
      </div>
    );
  }

  const error = clients.error ?? profilError;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refresh();
          clients.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes clients"
        description="Ajoutez vos clients et suivez l'activation de leurs comptes."
        actions={
          <Button
            type="button"
            onClick={openCreate}
            disabled={!canCreate}
            className="bg-brand text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Ajouter un client
          </Button>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          Vous pouvez consulter vos clients, mais les modifications sont désactivées.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      {canWrite && !abonnement?.peut_creer_client && (
        <Alert variant="info" title="Quota clients atteint">
          Vous avez atteint le nombre maximum de clients autorisé par votre abonnement.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Rechercher un client..."
              className="pl-9"
              aria-label="Rechercher un client"
            />
          </div>
          <p className="text-xs text-muted">
            {clientsUsed} client{clientsUsed > 1 ? "s" : ""}
            {clientsMax === null ? " • quota illimité" : ` sur ${clientsMax}`}
          </p>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-5">
            {items.length === 0 ? (
              <EmptyState
                title="Aucun client"
                description="Ajoutez votre premier client : un code d'activation sera généré et devra lui être communiqué manuellement."
                icon={<Users className="h-5 w-5" aria-hidden="true" />}
                action={
                  canCreate ? (
                    <Button
                      type="button"
                      onClick={openCreate}
                      className="bg-brand text-white hover:bg-brand-dark"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un client
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <EmptyState
                title="Aucun résultat"
                description="Aucun client ne correspond à votre recherche."
                icon={<Search className="h-5 w-5" aria-hidden="true" />}
                action={
                  <Button type="button" variant="outline" onClick={() => handleSearch("")}>
                    Réinitialiser la recherche
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
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Solde dû</th>
                  <th className="px-5 py-3 font-medium">Créé le</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((client) => {
                  const status = compteStatus(client.compte_active);
                  const fullName =
                    [client.prenom, client.nom].filter(Boolean).join(" ") || client.telephone;

                  return (
                    <tr key={client.id} className="transition-colors hover:bg-surface/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                            {(client.prenom || client.telephone).slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-ink">{fullName}</p>
                            <p className="truncate text-xs text-muted">
                              {client.telephone}
                              {client.adresse ? ` · ${client.adresse}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        {formatMoney(client.solde_du, devise)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(client.date_creation)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!client.compte_active && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Renvoyer le code d'activation"
                              title="Renvoyer le code d'activation"
                              disabled={resendingId === client.id}
                              onClick={() => handleResend(client)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Voir le client"
                            title="Voir le client"
                            onClick={() => setViewing(client)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Modifier le client"
                            title="Modifier le client"
                            disabled={!canWrite}
                            onClick={() => setEditing(client)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Supprimer le client"
                            title="Supprimer le client"
                            disabled={!canWrite}
                            onClick={() => setDeleting(client)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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
          itemLabel="clients"
          onPageChange={setPage}
        />
      </div>

      {createOpen && (
        <ClientCreateModal
          onClose={closeCreate}
          onSaved={(client) => {
            clients.refetch();
            refresh();
            setSuccess(
              client.montant_credit_initial
                ? `Le client ${client.telephone} a été ajouté avec un crédit initial de ${formatMoney(client.montant_credit_initial, devise)}.`
                : `Le client ${client.telephone} a été ajouté.`,
            );
            if (client.code_activation) {
              setActivation({ telephone: client.telephone, code: client.code_activation });
            }
          }}
        />
      )}

      {editing && (
        <ClientEditModal
          key={editing.id}
          client={editing}
          onClose={() => setEditing(null)}
          onSaved={(client) => {
            clients.refetch();
            setSuccess(`Le client ${client.telephone} a été mis à jour.`);
          }}
        />
      )}

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Détails du client"
        description={
          viewing
            ? [viewing.prenom, viewing.nom].filter(Boolean).join(" ") || viewing.telephone
            : undefined
        }
        size="lg"
      >
        {viewing && (
          <div className="space-y-4">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-muted">Statut du compte</dt>
                <dd className="mt-1">
                  <Badge tone={compteStatus(viewing.compte_active).tone}>
                    {compteStatus(viewing.compte_active).label}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Nom</dt>
                <dd className="mt-1 font-medium text-ink">{viewing.nom || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Prénom</dt>
                <dd className="mt-1 font-medium text-ink">{viewing.prenom || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Téléphone</dt>
                <dd className="mt-1 font-medium text-ink">{viewing.telephone}</dd>
              </div>
              <div>
                <dt className="text-muted">Adresse</dt>
                <dd className="mt-1 text-ink">{viewing.adresse || "Non renseignée"}</dd>
              </div>
              <div>
                <dt className="text-muted">Crédit initial</dt>
                <dd className="mt-1 font-medium text-ink">
                  {viewing.montant_credit_initial
                    ? formatMoney(viewing.montant_credit_initial, devise)
                    : "Non attribué"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Solde dû</dt>
                <dd className="mt-1 font-medium text-ink">
                  {formatMoney(viewing.solde_du, devise)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Solde disponible</dt>
                <dd className="mt-1 font-medium text-ink">
                  {formatMoney(viewing.solde_disponible, devise)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Créé le</dt>
                <dd className="mt-1 text-ink">{formatDate(viewing.date_creation, true)}</dd>
              </div>
              <div>
                <dt className="text-muted">Activé le</dt>
                <dd className="mt-1 text-ink">
                  {viewing.date_activation
                    ? formatDate(viewing.date_activation, true)
                    : "Non activé"}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              {!viewing.compte_active && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={resendingId === viewing.id}
                  onClick={() => handleResend(viewing)}
                >
                  <Send className="h-4 w-4" />
                  Nouveau code
                </Button>
              )}
              {viewing.montant_credit_initial ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canWrite}
                  onClick={() => {
                    setViewing(null);
                    setCorrectionClient(viewing);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Corriger le solde
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canWrite}
                  onClick={() => {
                    setViewing(null);
                    setSoldeClient(viewing);
                  }}
                >
                  <Wallet className="h-4 w-4" />
                  Attribuer le crédit initial
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={!canWrite}
                onClick={() => {
                  setViewing(null);
                  setEditing(viewing);
                }}
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!canWrite}
                onClick={() => {
                  setViewing(null);
                  setDeleting(viewing);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {soldeClient && (
        <SoldeAttributionModal
          client={soldeClient}
          onClose={() => setSoldeClient(null)}
          onSaved={(transaction) => {
            clients.refetch();
            setSuccess(
              `Un crédit initial de ${formatMoney(transaction.montant, devise)} a été attribué à ${soldeClient.telephone}.`,
            );
          }}
        />
      )}

      {correctionClient && (
        <SoldeCorrectionModal
          client={correctionClient}
          devise={devise}
          onClose={() => setCorrectionClient(null)}
          onSaved={(transaction) => {
            clients.refetch();
            setSuccess(
              `Le solde de ${correctionClient.telephone} a été corrigé de ${formatMoney(transaction.montant, devise)}.`,
            );
          }}
        />
      )}

      {activation && (
        <ActivationCodeModal
          telephone={activation.telephone}
          code={activation.code}
          role="client"
          onClose={() => setActivation(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer le client"
        description={`Voulez-vous vraiment supprimer le client ${deleting?.telephone ?? ""} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
