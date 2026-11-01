import { useMemo, useState } from "react";
import {
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getAllClients } from "../../../services/clientService";
import type { Client } from "../../../types/fournisseur";
import { formatMoney } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { Input } from "../../../shared/ui/input";
import { TableSkeleton } from "../../../shared/ui/loading";
import { PageHeader } from "../../../shared/ui/page-header";
import { Pagination } from "../../../shared/ui/pagination";
import { Select } from "../../../shared/ui/select";
import { ClientAgentDetailModal } from "../components/ClientAgentDetailModal";
import { compteStatus } from "../../fournisseur/lib/status";

const PAGE_SIZE = 10;
type StatusFilter = "TOUS" | "ACTIFS" | "INACTIFS";

export function ClientsAgentPage() {
  const clients = useAllPages(getAllClients);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TOUS");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Client | null>(null);

  const items = useMemo(() => clients.data?.items ?? [], [clients.data]);

  const summary = useMemo(() => {
    const active = items.filter((client) => client.compte_active);
    return {
      total: items.length,
      active: active.length,
      inactive: items.length - active.length,
      disponible: active.reduce(
        (total, client) => total + Number(client.solde_disponible),
        0,
      ),
    };
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((client) => {
      if (status === "ACTIFS" && !client.compte_active) return false;
      if (status === "INACTIFS" && client.compte_active) return false;
      if (!term) return true;

      return (
        `${client.prenom} ${client.nom}`.toLowerCase().includes(term) ||
        client.telephone.toLowerCase().includes(term) ||
        client.adresse.toLowerCase().includes(term) ||
        String(client.id).includes(term.replace(/^#/, ""))
      );
    });
  }, [items, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setStatus("TOUS");
    setPage(1);
  };

  if (clients.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Clients"
          description="Consultez les clients de votre fournisseur et leurs soldes."
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

  if (clients.error) {
    return <ErrorState message={clients.error} onRetry={clients.refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Consultez les clients de votre fournisseur et leurs soldes. La gestion du compte reste réservée au fournisseur."
        actions={
          <Button type="button" variant="outline" onClick={clients.refetch}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-xl border border-brand/10 bg-brand-soft/60 px-4 py-3 text-xs text-brand">
        <UserCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Mode consultation uniquement. Vous ne pouvez pas créer, modifier ni attribuer de solde à un
        client.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">Clients</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Users className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">{summary.total}</p>
          <p className="mt-1 text-xs text-muted">Dans votre réseau</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-emerald-700">Comptes actifs</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserCheck className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{summary.active}</p>
          <p className="mt-1 text-xs text-emerald-700">Prêts pour encaissement</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-amber-700">À activer</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-900">{summary.inactive}</p>
          <p className="mt-1 text-xs text-amber-700">Comptes en attente</p>
        </div>
        <div className="rounded-2xl border border-border bg-brand p-5 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-white/65">Solde disponible</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <Wallet className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatMoney(summary.disponible)}</p>
          <p className="mt-1 text-xs text-white/55">Cumul des clients actifs</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
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
                placeholder="Nom, téléphone, adresse ou n°"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as StatusFilter);
                  setPage(1);
                }}
                className="sm:w-44"
                aria-label="Filtrer par statut"
              >
                <option value="TOUS">Tous les comptes</option>
                <option value="ACTIFS">Comptes actifs</option>
                <option value="INACTIFS">À activer</option>
              </Select>
              {(search || status !== "TOUS") && (
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
              title="Aucun client trouvé"
              description={
                items.length === 0
                  ? "Aucun client n'est disponible pour le moment."
                  : "Aucun client ne correspond à vos filtres."
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
                    <th className="px-5 py-3 font-medium">Client</th>
                    <th className="px-5 py-3 font-medium">Contact</th>
                    <th className="px-5 py-3 font-medium">Solde dû</th>
                    <th className="px-5 py-3 font-medium">Disponible</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((client) => {
                    const statusConfig = compteStatus(client.compte_active);

                    return (
                      <tr key={client.id} className="transition-colors hover:bg-surface/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-xs font-semibold text-brand">
                              {client.prenom.charAt(0)}
                              {client.nom.charAt(0)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-ink">
                                {client.prenom} {client.nom}
                              </p>
                              <p className="mt-0.5 text-xs text-muted">Client #{client.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="flex items-center gap-1.5 text-xs text-ink">
                            <Phone className="h-3 w-3 text-muted" aria-hidden="true" />
                            {client.telephone}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {client.adresse || "Adresse non renseignée"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">
                          {formatMoney(client.solde_du)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-emerald-700">
                          {formatMoney(client.solde_disponible)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setViewing(client)}
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
              itemLabel="clients"
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Alert variant="info">
        Les soldes affichés proviennent directement du serveur. Contactez le fournisseur pour toute
        correction ou attribution de crédit initial.
      </Alert>

      <ClientAgentDetailModal client={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
