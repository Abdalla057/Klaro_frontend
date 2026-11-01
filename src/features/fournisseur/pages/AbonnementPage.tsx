import type { ReactNode } from "react";
import { CalendarDays, CreditCard, Info, Users, UserRound } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { CardSkeleton } from "../../../shared/ui/loading";
import { ErrorState } from "../../../shared/ui/error-state";
import { PageHeader } from "../../../shared/ui/page-header";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate, formatMoney } from "../lib/format";
import { abonnementStatusLabel, abonnementStatusTone } from "../lib/status";

function QuotaBar({
  label,
  used,
  max,
  icon,
}: {
  label: string;
  used: number;
  max: number | null;
  icon: ReactNode;
}) {
  const percent = max === null ? 100 : max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
            {icon}
          </span>
          <p className="text-sm font-medium text-ink">{label}</p>
        </div>
        <p className="text-sm font-semibold text-ink">
          {used}
          <span className="font-normal text-muted">
            {max === null ? " / illimité" : ` / ${max}`}
          </span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-soft">
        <div className="h-full rounded-full bg-brand-accent" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {max === null
          ? "Aucune limite définie par votre plan."
          : `${Math.max(0, max - used)} place${max - used > 1 ? "s" : ""} restante${max - used > 1 ? "s" : ""}.`}
      </p>
    </div>
  );
}

export function AbonnementPage() {
  const { abonnement, loading, error, refresh } = useFournisseur();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Mon abonnement
          </h1>
          <p className="mt-1 text-sm text-muted">
            Consultez votre plan, vos quotas et votre échéance.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton className="lg:col-span-2" />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!abonnement) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon abonnement"
          description="Consultez votre plan, vos quotas et votre échéance."
        />
        <Alert variant="warning" title="Aucun abonnement">
          Aucun abonnement n'est associé à votre compte. Contactez l'administrateur pour en
          souscrire un.
        </Alert>
      </div>
    );
  }

  const planNom = abonnement.plan?.nom ?? abonnement.abonnement?.plan_nom ?? "Aucun plan";
  const statutLabel = abonnementStatusLabel(abonnement.statut, abonnement.est_actif);
  const statutTone = abonnementStatusTone(abonnement.statut, abonnement.est_actif);
  const estEssai = Boolean(abonnement.abonnement?.est_essai ?? abonnement.plan?.est_essai);
  const montant = abonnement.abonnement?.montant ?? abonnement.plan?.prix ?? null;
  const devise = abonnement.abonnement?.devise ?? abonnement.plan?.devise ?? null;
  const dateDebut = abonnement.date_debut ?? abonnement.abonnement?.date_debut ?? null;
  const dateFin = abonnement.date_fin ?? abonnement.abonnement?.date_fin ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon abonnement"
        description="Consultez votre plan, vos quotas et votre échéance."
        actions={<Badge tone={statutTone}>{statutLabel}</Badge>}
      />

      {!abonnement.est_actif && (
        <Alert variant="warning" title="Abonnement inactif">
          Votre abonnement est {statutLabel.toLowerCase()}. Les créations de clients et d'agents
          ainsi que les décisions sur les décaissements sont désactivées. Contactez
          l'administrateur pour le renouveler.
        </Alert>
      )}

      {estEssai && (
        <Alert variant="info" title="Période d'essai">
          Vous bénéficiez actuellement de la période d'essai gratuite.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Plan actuel</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{planNom}</h2>
              {abonnement.plan?.description && (
                <p className="mt-1 max-w-xl text-sm text-muted">{abonnement.plan.description}</p>
              )}
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <CreditCard className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Début
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{formatDate(dateDebut)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Échéance
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">{formatDate(dateFin)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Jours restants</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{abonnement.jours_restants}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Montant</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {formatMoney(montant, devise)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-start gap-3 rounded-xl bg-surface px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-sm text-muted">
                La gestion des paiements et des renouvellements est assurée par l'administrateur.
                Contactez-le pour toute modification de votre plan.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Droits de création</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Clients
                </span>
                <Badge tone={abonnement.peut_creer_client ? "success" : "neutral"}>
                  {abonnement.peut_creer_client ? "Autorisé" : "Indisponible"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Agent
                </span>
                <Badge tone={abonnement.peut_creer_agent ? "success" : "neutral"}>
                  {abonnement.peut_creer_agent ? "Autorisé" : "Indisponible"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Quotas</h2>
            <div className="mt-4 space-y-4">
              <QuotaBar
                label="Clients"
                used={abonnement.utilisation?.clients ?? 0}
                max={abonnement.quotas?.clients ?? null}
                icon={<Users className="h-4 w-4" aria-hidden="true" />}
              />
              <QuotaBar
                label="Agents"
                used={abonnement.utilisation?.agents ?? 0}
                max={abonnement.quotas?.agents ?? null}
                icon={<UserRound className="h-4 w-4" aria-hidden="true" />}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
