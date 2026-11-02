import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  UserRound,
  XCircle,
} from "lucide-react";
import type { DemandeDecaissement } from "../../../types/fournisseur";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { Modal } from "../../../shared/ui/modal";
import { DEMANDE_CLIENT_STATUS, peutAnnulerDemande } from "../lib/status";

export function ClientDemandeDetailModal({
  demande,
  onClose,
  onAnnuler,
}: {
  demande: DemandeDecaissement | null;
  onClose: () => void;
  onAnnuler?: (demande: DemandeDecaissement) => void;
}) {
  if (!demande) return null;

  const status = DEMANDE_CLIENT_STATUS[demande.statut];
  const peutAnnuler = peutAnnulerDemande(demande.statut) && !!onAnnuler;

  return (
    <Modal
      open={!!demande}
      onClose={onClose}
      title={`Demande ${demande.reference}`}
      description="Suivi de votre demande de décaissement."
      size="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-brand p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                Montant demandé
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatMoney(demande.montant)}
              </p>
            </div>
            <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
              {status.label}
            </Badge>
          </div>
          <p className="mt-4 text-xs text-white/65">{status.description}</p>
          <p className="mt-3 flex items-center gap-2 text-xs text-white/55">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Créée le {formatDate(demande.date_creation, true)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Compte client
          </p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink">{demande.client_nom}</p>
              <p className="mt-0.5 text-xs text-muted">{demande.client_telephone}</p>
            </div>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Statut actuel</dt>
            <dd>
              <Badge tone={status.tone}>{status.label}</Badge>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-muted">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              Confirmation agent
            </dt>
            <dd className="text-right font-medium text-ink">
              {formatDate(demande.date_confirmation_agent, true)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-muted">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Décision du fournisseur
            </dt>
            <dd className="text-right font-medium text-ink">
              {formatDate(demande.date_decision, true)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-muted">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Date de paiement
            </dt>
            <dd className="text-right font-medium text-ink">
              {formatDate(demande.date_paiement, true)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-muted">
              <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
              Votre commentaire
            </dt>
            <dd className="max-w-[60%] text-right text-ink">{demande.commentaire || "—"}</dd>
          </div>
        </dl>

        {demande.motif_refus && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="flex items-center gap-1.5 font-medium">
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Motif du refus
            </p>
            <p className="mt-1">{demande.motif_refus}</p>
          </div>
        )}

        {peutAnnuler && (
          <div className="border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                onClose();
                onAnnuler(demande);
              }}
            >
              <Ban className="h-4 w-4" />
              Annuler cette demande
            </Button>
            <p className="mt-2 text-center text-xs text-muted">
              L'annulation libère immédiatement le montant réservé.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
