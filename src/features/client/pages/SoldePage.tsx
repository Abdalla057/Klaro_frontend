import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Clock3,
  Info,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { formatMoney } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Card } from "../../../shared/ui/card";
import { CardSkeleton } from "../../../shared/ui/loading";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { PageHeader } from "../../../shared/ui/page-header";
import { useClient } from "../context/clientContextCore";

export function SoldePage() {
  const { profil, solde, loading, error, refresh } = useClient();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon solde"
          description="Consultez le détail de votre solde et des montants réservés."
        />
        <CardSkeleton className="h-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!solde) {
    return (
      <ErrorState
        message="Votre solde est introuvable. Contactez votre fournisseur."
        onRetry={refresh}
      />
    );
  }

  const disponible = Number(solde.solde_disponible);
  const du = Number(solde.solde_du);
  const enCours = Number(solde.montant_en_cours);
  const ratio = du > 0 ? Math.min(100, Math.max(0, (disponible / du) * 100)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon solde"
        description="Le solde disponible correspond à votre solde dû moins les demandes encore en cours."
        actions={
          <Button
            asChild
            className="bg-brand text-white hover:bg-brand-dark"
          >
            <Link to="/client/demandes/nouvelle">
              <Plus className="h-4 w-4" />
              Demander un décaissement
            </Link>
          </Button>
        }
      />

      {!profil?.compte_active && (
        <Alert variant="warning" title="Compte en attente d'activation">
          Activation requise avant de pouvoir soumettre une demande de décaissement.
        </Alert>
      )}

      <section className="rounded-panel bg-brand p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-eyebrow uppercase text-white/50">Solde disponible</p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.03em] tabular-nums">
              {formatMoney(solde.solde_disponible)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/65">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {profil?.compte_active ? "Compte activé et opérationnel" : "Activation requise"}
            </p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/10 px-4 py-3 text-sm">
            <p className="text-white/55">Téléphone associé</p>
            <p className="mt-0.5 font-medium">{solde.telephone}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Part encore mobilisable</span>
            <span>{du > 0 ? `${Math.round(ratio)} %` : "—"}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${ratio}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-[13px] font-medium text-muted">Solde dû</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-brand-soft text-brand">
              <Wallet className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-kpi tabular-nums text-ink">{formatMoney(solde.solde_du)}</p>
          <p className="mt-2 text-xs text-muted">Montant total restant à rembourser.</p>
        </Card>

        <Card className="border-warning/15 bg-warning-soft/50 p-5">
          <div className="flex items-start justify-between">
            <p className="text-[13px] font-medium text-warning">Montant en cours</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-warning-soft text-warning">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-kpi tabular-nums text-ink">
            {formatMoney(solde.montant_en_cours)}
          </p>
          <p className="mt-2 text-xs text-muted">Demandes de décaissement non finalisées.</p>
        </Card>

        <Card className="border-success/15 bg-success-soft/50 p-5">
          <div className="flex items-start justify-between">
            <p className="text-[13px] font-medium text-success">Solde disponible</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.65rem] bg-success-soft text-success">
              <Banknote className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-kpi tabular-nums text-ink">
            {formatMoney(solde.solde_disponible)}
          </p>
          <p className="mt-2 text-xs text-muted">Montant maximal que vous pouvez demander.</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Info className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">Comprendre votre solde</h2>
              <p className="mt-1 text-sm text-muted">
                Le solde dû correspond au montant restant de votre remboursement. Chaque demande
                de décaissement en cours réserve une partie de ce solde jusqu'à sa décision
                finale.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Une demande en attente, confirmée ou approuvée réduit votre solde disponible.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Une demande annulée ou refusée libère le montant réservé.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              Un décaissement payé est déduit définitivement de votre solde dû.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Que voulez-vous faire ?</h2>
          <p className="mt-1 text-sm text-muted">
            Les opérations disponibles depuis votre espace client.
          </p>

          {enCours > 0 ? (
            <div className="mt-4">
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-xs font-medium text-ink">Montant réservé</p>
                <p className="mt-1 text-lg font-semibold text-amber-700">
                  {formatMoney(solde.montant_en_cours)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Ce montant sera réintégré si vous annulez vos demandes en cours.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to="/client/demandes">
                  Suivre mes demandes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="Aucun montant en cours"
                description="Votre solde disponible est entièrement mobilisable."
              />
              <Button asChild className="mt-3 w-full bg-brand text-white hover:bg-brand-dark">
                <Link to="/client/demandes/nouvelle">
                  <Plus className="h-4 w-4" />
                  Demander un décaissement
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SoldePage;
