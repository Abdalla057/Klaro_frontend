import { ArrowDownLeft, ArrowUpRight, CalendarDays, MessageSquareText } from "lucide-react";
import type { TransactionFinanciere } from "../../../types/fournisseur";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import { Badge } from "../../../shared/ui/badge";
import { Modal } from "../../../shared/ui/modal";
import { cn } from "../../../shared/utils/cn";
import {
  TRANSACTION_CLIENT_SENS_LABELS,
  TRANSACTION_CLIENT_STATUS,
  TRANSACTION_CLIENT_TYPE_LABELS,
} from "../lib/status";

export function ClientTransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: TransactionFinanciere | null;
  onClose: () => void;
}) {
  if (!transaction) return null;

  const status = TRANSACTION_CLIENT_STATUS[transaction.statut];
  const isCredit = transaction.sens === "CREDIT";

  return (
    <Modal
      open={!!transaction}
      onClose={onClose}
      title={`Transaction ${transaction.reference}`}
      description="Détail du mouvement financier sur votre compte."
      size="md"
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                {isCredit ? (
                  <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
                )}
                {TRANSACTION_CLIENT_SENS_LABELS[transaction.sens]}
              </p>
              <p
                className={cn(
                  "mt-2 text-3xl font-semibold tracking-tight",
                  isCredit ? "text-emerald-700" : "text-red-700",
                )}
              >
                {isCredit ? "+" : "−"}
                {formatMoney(transaction.montant)}
              </p>
            </div>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Enregistrée le {formatDate(transaction.date_creation, true)}
          </p>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Type de mouvement</dt>
            <dd className="font-medium text-ink">
              {TRANSACTION_CLIENT_TYPE_LABELS[transaction.type_transaction]}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Référence</dt>
            <dd className="font-medium text-ink">{transaction.reference}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Sens</dt>
            <dd className="font-medium text-ink">
              {TRANSACTION_CLIENT_SENS_LABELS[transaction.sens]}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-6">
            <dt className="flex items-center gap-1.5 text-muted">
              <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
              Commentaire
            </dt>
            <dd className="max-w-[60%] text-right text-ink">{transaction.commentaire || "—"}</dd>
          </div>
          {transaction.agent_nom && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Agent associé</dt>
              <dd className="font-medium text-ink">{transaction.agent_nom}</dd>
            </div>
          )}
        </dl>

        <div className="rounded-xl border border-border bg-white px-4 py-3 text-xs text-muted">
          Les transactions validées impactent votre solde. Les transactions annulées sont
          conservées pour l'historique.
        </div>
      </div>
    </Modal>
  );
}
