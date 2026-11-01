import { CheckCircle2, Clock3, Phone, UserRound, Wallet } from "lucide-react";
import type { Client, Encaissement } from "../../../types/fournisseur";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { Modal } from "../../../shared/ui/modal";
import { ENCAISSEMENT_AGENT_STATUS } from "../lib/status";

export function EncaissementDetailModal({
  encaissement,
  client,
  onClose,
  onConfirm,
}: {
  encaissement: Encaissement | null;
  client?: Client;
  onClose: () => void;
  onConfirm: (encaissement: Encaissement) => void;
}) {
  if (!encaissement) return null;

  const status = ENCAISSEMENT_AGENT_STATUS[encaissement.statut];

  return (
    <Modal
      open={!!encaissement}
      onClose={onClose}
      title={`Encaissement #${encaissement.id}`}
      description="Détail du paiement et informations client."
      size="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-brand p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">Montant</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatMoney(encaissement.montant)}
              </p>
            </div>
            <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
              {status.label}
            </Badge>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/65">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Créé le {formatDate(encaissement.date_creation, true)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Client</p>
          <div className="mt-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-ink">
                {client ? `${client.prenom} ${client.nom}` : `Client #${encaissement.client}`}
              </p>
              {client && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {client.telephone}
                </p>
              )}
            </div>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-2 text-muted">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Statut
            </dt>
            <dd>
              <Badge tone={status.tone}>{status.label}</Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Date de confirmation</dt>
            <dd className="text-right font-medium text-ink">
              {formatDate(encaissement.date_confirmation, true)}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="text-muted">Commentaire</dt>
            <dd className="text-right text-ink">{encaissement.commentaire || "—"}</dd>
          </div>
        </dl>

        {encaissement.statut === "EN_ATTENTE" && (
          <div className="border-t border-border pt-4">
            <Button
              type="button"
              className="w-full bg-brand text-white hover:bg-brand-dark"
              onClick={() => {
                onClose();
                onConfirm(encaissement);
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmer cet encaissement
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
