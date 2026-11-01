import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Send,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import {
  deleteAgent,
  getAllAgents,
  resendAgentCode,
} from "../../../services/agentService";
import { getApiError } from "../../../services/apiError";
import type { Agent } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { PageHeader } from "../../../shared/ui/page-header";
import { ActivationCodeModal } from "../components/ActivationCodeModal";
import { AgentCreateModal } from "../components/AgentCreateModal";
import { AgentEditModal } from "../components/AgentEditModal";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate } from "../lib/format";
import { compteStatus } from "../lib/status";

type ActivationCode = {
  telephone: string;
  code: string | null;
};

export function AgentPage() {
  const agents = useAllPages(getAllAgents);
  const {
    abonnement,
    loading: profilLoading,
    error: profilError,
    refresh,
  } = useFournisseur();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState<Agent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [activation, setActivation] = useState<ActivationCode | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const agentItems = agents.data?.items ?? [];
  const canWrite = Boolean(abonnement?.est_actif);
  const canCreate = Boolean(canWrite && abonnement?.peut_creer_agent);
  const agentsUsed = abonnement?.utilisation?.agents ?? agents.data?.count ?? 0;
  const agentsMax = abonnement?.quotas?.agents ?? null;

  const handleResend = async (agent: Agent) => {
    setActionError(null);
    setSuccess(null);
    setResendingId(agent.id);

    try {
      const response = await resendAgentCode(agent.telephone);
      setActivation({ telephone: agent.telephone, code: response.code_activation });
      setSuccess(`Un nouveau code d'activation a été généré pour ${agent.telephone}.`);
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
      await deleteAgent(deleting.id);
      setSuccess(`L'agent ${deleting.prenom} ${deleting.nom}`.trim() + " a été supprimé.");
      agents.refetch();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setDeleteLoading(false);
      setDeleting(null);
    }
  };

  if (agents.loading || profilLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Agents</h1>
          <p className="mt-1 text-sm text-muted">
            Gérez les agents chargés de confirmer les encaissements.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-4 h-4 w-56" />
              <Skeleton className="mt-2 h-4 w-44" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const error = agents.error ?? profilError;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refresh();
          agents.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Ajoutez plusieurs agents et communiquez-leur manuellement leur code d'activation."
        actions={
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={!canCreate}
            className="bg-brand text-white hover:bg-brand-dark"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un agent
          </Button>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          Vous pouvez consulter vos agents, mais les modifications sont désactivées.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      {canWrite && !abonnement?.peut_creer_agent && (
        <Alert variant="info" title="Quota agents atteint">
          Votre abonnement ne permet pas d'ajouter un agent supplémentaire.{" "}
          <Link to="/fournisseur/abonnement" className="font-medium underline">
            Voir mon abonnement
          </Link>
        </Alert>
      )}

      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm">
        <span className="flex items-center gap-2 text-muted">
          <Users className="h-4 w-4" aria-hidden="true" />
          Agents enregistrés
        </span>
        <span className="font-medium text-ink">
          {agentsUsed}
          {agentsMax === null ? " • quota illimité" : ` / ${agentsMax}`}
        </span>
      </div>

      {agentItems.length === 0 ? (
        <EmptyState
          title="Aucun agent"
          description="Ajoutez votre premier agent pour qu'il puisse confirmer les encaissements de vos clients."
          icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
          action={
            canCreate ? (
              <Button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="bg-brand text-white hover:bg-brand-dark"
              >
                <Plus className="h-4 w-4" />
                Ajouter un agent
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {agentItems.map((agent) => {
            const status = compteStatus(agent.compte_active);
            const fullName =
              [agent.prenom, agent.nom].filter(Boolean).join(" ") || agent.telephone;

            return (
              <section
                key={agent.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-ink">{fullName}</h2>
                      <p className="text-sm text-muted">{agent.telephone}</p>
                    </div>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>

                <dl className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      Téléphone
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">{agent.telephone}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      Zone / secteur
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">
                      {agent.zone || "Non renseignée"}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      Ajouté le
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">
                      {formatDate(agent.date_creation, true)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      Activation
                    </dt>
                    <dd className="mt-1 text-sm text-muted">
                      {agent.compte_active
                        ? `Activé le ${formatDate(agent.date_activation, true)}`
                        : "En attente de la communication du code"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {!agent.compte_active && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={resendingId === agent.id}
                      onClick={() => handleResend(agent)}
                    >
                      <Send className="h-4 w-4" />
                      {resendingId === agent.id ? "Génération..." : "Nouveau code"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canWrite}
                    onClick={() => setEditing(agent)}
                  >
                    <Pencil className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={!canWrite}
                    onClick={() => setDeleting(agent)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Alert variant="info" title="Bon à savoir">
        Plusieurs agents peuvent être rattachés à votre entreprise. Chaque code d'activation est
        valable 10 minutes et doit être transmis manuellement : aucun SMS n'est envoyé
        automatiquement.
      </Alert>

      {createOpen && (
        <AgentCreateModal
          onClose={() => setCreateOpen(false)}
          onSaved={(created) => {
            agents.refetch();
            refresh();
            setSuccess(`L'agent ${created.telephone} a été ajouté.`);
            if (created.code_activation) {
              setActivation({ telephone: created.telephone, code: created.code_activation });
            }
          }}
        />
      )}

      {editing && (
        <AgentEditModal
          key={editing.id}
          agent={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            agents.refetch();
            setSuccess(`L'agent ${updated.telephone} a été mis à jour.`);
          }}
        />
      )}

      {activation && (
        <ActivationCodeModal
          telephone={activation.telephone}
          code={activation.code}
          role="agent"
          onClose={() => setActivation(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Supprimer l'agent"
        description={`Voulez-vous vraiment supprimer l'agent ${deleting?.telephone ?? ""} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
