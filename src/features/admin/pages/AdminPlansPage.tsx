import { useMemo } from "react";
import { Check, RefreshCw } from "lucide-react";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { formatMoney } from "../../../shared/utils/format";
import { ListPageHeader } from "../components/ListPage";
import { Panel } from "../components/dashboard/Panel";
import { useAdminData } from "../context/adminContextCore";
import { statutAbonnement } from "../lib/dashboard";

export function AdminPlansPage() {
  const { plans, abonnements, loading, error, refresh } = useAdminData();

  const abonnesParPlan = useMemo(() => {
    const map = new Map<number, number>();
    for (const a of abonnements) {
      if (statutAbonnement(a) === "ACTIF") map.set(a.plan.id, (map.get(a.plan.id) ?? 0) + 1);
    }
    return map;
  }, [abonnements]);

  if (loading && plans.length === 0) return <Skeleton className="h-96 rounded-[1.75rem]" />;
  if (error && plans.length === 0) return <ErrorState message={error} onRetry={() => void refresh(false)} />;

  return (
    <div className="space-y-4">
      <ListPageHeader
        titre="Plans d'abonnement"
        description="Offres proposées aux fournisseurs, avec leur prix, leur durée et leurs limites."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh(true)}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {plans.length === 0 ? (
        <Panel className="py-14 text-center text-sm text-muted">Aucun plan d'abonnement n'est défini.</Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Panel key={plan.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-ink">{plan.nom}</h2>
                  <p className="text-xs text-muted">Code {plan.code}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {plan.est_essai && <Badge tone="warning">Essai</Badge>}
                  <Badge tone={plan.actif ? "success" : "neutral"}>{plan.actif ? "Actif" : "Inactif"}</Badge>
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
                {formatMoney(plan.prix, plan.devise)}
                <span className="ml-1 text-sm font-medium text-muted">/ {plan.duree_jours} jours</span>
              </p>

              {plan.description && <p className="mt-2 text-sm text-muted">{plan.description}</p>}

              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-pine" />
                  {plan.max_clients === null ? "Clients illimités" : `Jusqu'à ${plan.max_clients} clients`}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-pine" />
                  {plan.max_agents === null ? "Agents illimités" : `Jusqu'à ${plan.max_agents} agents`}
                </li>
              </ul>

              <div className="mt-5 rounded-2xl bg-sage/70 px-4 py-3 text-sm text-ink">
                <span className="font-semibold">{abonnesParPlan.get(plan.id) ?? 0}</span>{" "}
                <span className="text-muted">abonnement(s) actif(s)</span>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPlansPage;
