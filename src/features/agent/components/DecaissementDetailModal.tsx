import { CalendarDays, CheckCircle2, MessageSquareText, Phone, UserRound } from "lucide-react";
import type { DemandeDecaissement } from "../../../types/fournisseur";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { Modal } from "../../../shared/ui/modal";
import { DECAISSEMENT_AGENT_STATUS } from "../lib/status";

export function DecaissementDetailModal({
  demande,
  onClose,
  onConfirm,
}: {
  demande: DemandeDecaissement | null;
  onClose: () => void;
  onConfirm: (demande: DemandeDecaissement) => void;
}) {
  if (!demande) return null;

  const status = DECAISSEMENT_AGENT_STATUS[demande.statut];

  return (
    <Modal
      open={!!demande}
      onClose={onClose}
      title={`Demande ${demande.reference}`}
      description="Détail de la demande de décaissement."
      size="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-brand p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">Montant</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatMoney(demande.montant)}
              </p>
            </div>
            <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
              {status.label}
            </Badge>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-white/65">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Créée le {formatDate(demande.date_creation, true)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Client</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink">{demande.client_nom}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {demande.client_telephone}
              </p>
            </div>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Statut</dt>
            <dd>
              <Badge tone={status.tone}>{status.label}</Badge>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="text-muted">Confirmation agent</dt>
            <dd className="text-right font-medium text-ink">
              {formatDate(demande.date_confirmation_agent, true)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="text-muted">Décision fournisseur</dt>
            <dd className="text-right font-medium text-ink">
              {formatDate(demande.date_decision, true)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-muted">
              <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
              Commentaire
            </dt>
            <dd className="max-w-[60%] text-right text-ink">{demande.commentaire || "—"}</dd>
          </div>
          {demande.motif_refus && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Motif du refus</p>
              <p className="mt-1">{demande.motif_refus}</p>
            </div>
          )}
        </dl>

        {demande.statut === "EN_ATTENTE" && (
          <div className="border-t border-border pt-4">
            <Button
              type="button"
              className="w-full bg-brand text-white hover:bg-brand-dark"
              onClick={() => {
                onClose();
                onConfirm(demande);
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmer la demande
            </Button>
            <p className="mt-2 text-center text-xs text-muted">
              La validation et le paiement restent réservés au fournisseur.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
