import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BellRing,
  CheckCheck,
  FileText,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import {
  getAllNotifications,
  marquerNotificationLue,
  marquerToutesNotificationsLues,
} from "../../../services/commerceService";
import type { NotificationClient } from "../../../types/commerce";
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
import { cn } from "../../../shared/utils/cn";
import { formatRelativeDate } from "../../../shared/utils/format";
import { NOTIFICATION_CLIENT_TYPE } from "../../fournisseur/lib/commerceStatus";

const PAGE_SIZE = 10;

function notificationIcon(type: NotificationClient["type_notification"]) {
  if (type === "PAIEMENT_RECU") return Wallet;
  if (type === "NOUVELLE_FACTURE" || type === "NOUVELLE_VENTE") return FileText;
  return BellRing;
}

export function NotificationsPage() {
  const notifications = useAllPages(getAllNotifications);

  const [search, setSearch] = useState("");
  const [lectureFilter, setLectureFilter] = useState("TOUTES");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const items = useMemo(() => notifications.data?.items ?? [], [notifications.data]);
  const nonLues = items.filter((notification) => !notification.lue).length;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((notification) => {
      if (lectureFilter === "NON_LUES" && notification.lue) return false;
      if (lectureFilter === "LUES" && !notification.lue) return false;
      if (!term) return true;

      return (
        notification.titre.toLowerCase().includes(term) ||
        notification.message.toLowerCase().includes(term) ||
        notification.fournisseur_nom.toLowerCase().includes(term)
      );
    });
  }, [items, search, lectureFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleMarquerLue = async (notification: NotificationClient) => {
    if (notification.lue) return;
    setActionError(null);
    setSuccess(null);

    try {
      await marquerNotificationLue(notification.id);
      notifications.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    }
  };

  const handleToutMarquerLu = async () => {
    setActionLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      const nombre = await marquerToutesNotificationsLues();
      setSuccess(`${nombre} notification(s) marquée(s) comme lue(s).`);
      notifications.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (notifications.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Suivez les nouvelles factures et les paiements enregistrés."
        />
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={6} columns={3} />
        </div>
      </div>
    );
  }

  if (notifications.error) {
    return (
      <ErrorState message={notifications.error} onRetry={notifications.refetch} />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Suivez les nouvelles factures et les paiements enregistrés."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={notifications.refetch}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button
              type="button"
              onClick={handleToutMarquerLu}
              disabled={actionLoading || nonLues === 0}
            >
              <CheckCheck className="h-4 w-4" />
              {actionLoading ? "Traitement..." : "Tout marquer lu"}
            </Button>
          </div>
        }
      />

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
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
              placeholder="Titre, message ou commerce..."
              className="pl-9"
              aria-label="Rechercher"
            />
          </div>
          <Select
            value={lectureFilter}
            onChange={(event) => {
              setLectureFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par lecture"
            className="sm:w-48"
          >
            <option value="TOUTES">Toutes</option>
            <option value="NON_LUES">Non lues ({nonLues})</option>
            <option value="LUES">Lues</option>
          </Select>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Aucune notification"
              description="Vos notifications de factures et de paiements apparaîtront ici."
              icon={<Bell className="h-5 w-5" aria-hidden="true" />}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {pageItems.map((notification) => {
              const config = NOTIFICATION_CLIENT_TYPE[notification.type_notification];
              const Icon = notificationIcon(notification.type_notification);

              return (
                <li
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-start",
                    notification.lue ? "bg-white" : "bg-brand-soft/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      notification.lue
                        ? "bg-surface text-muted"
                        : "bg-brand-soft text-brand",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{notification.titre}</p>
                      <Badge tone={config.tone}>{config.label}</Badge>
                      {!notification.lue && (
                        <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted">
                      {notification.fournisseur_nom} ·{" "}
                      {formatRelativeDate(notification.date_creation)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {notification.facture && (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          to="/client/factures"
                          onClick={() => handleMarquerLue(notification)}
                        >
                          <FileText className="h-4 w-4" />
                          Voir la facture
                        </Link>
                      </Button>
                    )}
                    {!notification.lue && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarquerLue(notification)}
                      >
                        <CheckCheck className="h-4 w-4" />
                        Marquer lue
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="notifications"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default NotificationsPage;
