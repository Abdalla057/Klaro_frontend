import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Phone,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  getAllClientTransactions,
  getClientSolde,
} from "../../../services/clientService";
import { getApiError } from "../../../services/apiError";
import type {
  Client,
  SoldeClient,
  TransactionFinanciere,
} from "../../../types/fournisseur";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Modal } from "../../../shared/ui/modal";
import { Skeleton } from "../../../shared/ui/loading";
import { compteStatus } from "../../fournisseur/lib/status";

export function ClientAgentDetailModal({
  client,
  onClose,
}: {
  client: Client | null;
  onClose: () => void;
}) {
  if (!client) return null;

  return <ClientAgentDetailContent key={client.id} client={client} onClose={onClose} />;
}

function ClientAgentDetailContent({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const [solde, setSolde] = useState<SoldeClient | null>(null);
  const [transactions, setTransactions] = useState<TransactionFinanciere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getClientSolde(client.id), getAllClientTransactions(client.id)])
      .then(([soldeData, transactionsData]) => {
        if (cancelled) return;
        setSolde(soldeData);
        setTransactions(transactionsData.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client.id]);

  const status = compteStatus(client.compte_active);
  const recentTransactions = transactions.slice(0, 6);

  return (
    <Modal
      open={!!client}
      onClose={onClose}
      title={`${client.prenom} ${client.nom}`}
      description="Consultation du compte client et de ses dernières transactions."
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-brand p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                Solde disponible
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatMoney(solde?.solde_disponible ?? client.solde_disponible)}
              </p>
            </div>
            <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
              {status.label}
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 text-xs text-white/70 sm:grid-cols-2">
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {client.telephone}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {client.adresse || "Adresse non renseignée"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Solde dû</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {formatMoney(solde?.solde_du ?? client.solde_du)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Montant en cours</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {solde ? formatMoney(solde.montant_en_cours) : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Crédit initial</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {formatMoney(client.montant_credit_initial)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Client depuis {formatDate(client.date_creation)}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            {client.date_activation
              ? `Activé le ${formatDate(client.date_activation)}`
              : "Compte non activé"}
          </span>
        </div>

        <div className="rounded-2xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Dernières transactions</h3>
            <span className="text-xs text-muted">{transactions.length} au total</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-2 text-sm font-medium text-ink">Aucune transaction</p>
              <p className="mt-1 text-xs text-muted">
                Ce client n'a pas encore de mouvement financier.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={
                      transaction.sens === "DEBIT"
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                    }
                  >
                    {transaction.sens === "DEBIT" ? (
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {transaction.type_transaction_display}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(transaction.date_creation, true)} · {transaction.reference}
                    </p>
                  </div>
                  <p
                    className={
                      transaction.sens === "DEBIT"
                        ? "text-sm font-semibold text-red-600"
                        : "text-sm font-semibold text-emerald-600"
                    }
                  >
                    {transaction.sens === "DEBIT" ? "−" : "+"}
                    {formatMoney(transaction.montant)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="rounded-xl bg-surface px-3 py-2.5 text-xs text-muted">
          Consultation uniquement. La modification du compte et du solde est réservée au
          fournisseur.
        </p>
      </div>
    </Modal>
  );
}
