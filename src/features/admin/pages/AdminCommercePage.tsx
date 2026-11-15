import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getApiError } from "../../../services/apiError";
import { getStatistiquesCommerceAdmin } from "../../../services/commerceService";
import type { StatistiquesCommerceAdmin } from "../../../types/commerce";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { TableSkeleton } from "../../../shared/ui/loading";
import { PageHeader } from "../../../shared/ui/page-header";
import { StatCard } from "../../../shared/ui/stat-card";
import { formatMoney } from "../../../shared/utils/format";

export function AdminCommercePage() {
  const [stats, setStats] = useState<StatistiquesCommerceAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getStatistiquesCommerceAdmin()
      .then((value) => {
        if (cancelled) return;
        setStats(value);
        setError(null);
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
  }, [reloadKey]);

  const refresh = () => setReloadKey((key) => key + 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Supervision commerce"
          description="Vue globale des produits, ventes et créances des fournisseurs."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-border bg-white"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={6} columns={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const anomalies = stats?.anomalies;
  const anomaliesTotal =
    (anomalies?.ventes_incoherentes ?? 0) +
    (anomalies?.produits_stock_negatif ?? 0) +
    (anomalies?.notifications_echouees ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervision commerce"
        description="Vue globale des produits, ventes et créances des fournisseurs."
        actions={
          <Button type="button" variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {anomaliesTotal > 0 ? (
        <Alert variant="warning" title="Anomalies détectées">
          {anomalies?.ventes_incoherentes ?? 0} vente(s) incohérente(s),{" "}
          {anomalies?.produits_stock_negatif ?? 0} produit(s) à stock négatif et{" "}
          {anomalies?.notifications_echouees ?? 0} notification(s) échouée(s).
        </Alert>
      ) : (
        <Alert variant="success" title="Aucune anomalie">
          Les données commerciales sont cohérentes.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Fournisseurs actifs"
          value={stats?.totaux.fournisseurs_actifs ?? 0}
          hint="Ayant au moins un produit ou une vente"
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Produits"
          value={stats?.totaux.produits ?? 0}
          hint="Tous fournisseurs confondus"
          icon={<Package className="h-4 w-4" aria-hidden="true" />}
          tone="neutral"
        />
        <StatCard
          label="Volume des ventes"
          value={formatMoney(stats?.totaux.volume_ventes)}
          hint={`${stats?.totaux.ventes ?? 0} vente(s) validée(s)`}
          icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Créances"
          value={formatMoney(stats?.totaux.creances)}
          hint={`${formatMoney(stats?.totaux.montant_encaisse)} encaissés`}
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
          tone="danger"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Ventes incohérentes"
          value={anomalies?.ventes_incoherentes ?? 0}
          hint="Montants ou restes incohérents"
          icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Stocks négatifs"
          value={anomalies?.produits_stock_negatif ?? 0}
          hint="Produits à corriger"
          icon={<Package className="h-4 w-4" aria-hidden="true" />}
          tone="danger"
        />
        <StatCard
          label="Notifications échouées"
          value={anomalies?.notifications_echouees ?? 0}
          hint="Envois SMS/WhatsApp en échec"
          icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Détail par fournisseur</h2>
          <p className="mt-0.5 text-sm text-muted">
            Activité commerciale et créances de chaque entreprise.
          </p>
        </div>

        {(stats?.par_fournisseur.length ?? 0) === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Aucune activité commerciale"
              description="Les fournisseurs ayant des produits ou des ventes apparaîtront ici."
              icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Fournisseur</th>
                  <th className="px-5 py-3 font-medium">Produits</th>
                  <th className="px-5 py-3 font-medium">Ventes</th>
                  <th className="px-5 py-3 font-medium">Volume</th>
                  <th className="px-5 py-3 font-medium">Encaissé</th>
                  <th className="px-5 py-3 font-medium">Créances</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats?.par_fournisseur.map((fournisseur) => (
                  <tr
                    key={fournisseur.fournisseur}
                    className="transition-colors hover:bg-surface/60"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">
                        {fournisseur.nom_entreprise}
                      </p>
                      <p className="text-xs text-muted">
                        {fournisseur.code_entreprise}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {fournisseur.nombre_produits}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {fournisseur.nombre_ventes}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                      {formatMoney(fournisseur.volume_ventes)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-emerald-700">
                      {formatMoney(fournisseur.montant_encaisse)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge
                        tone={Number(fournisseur.creances) > 0 ? "warning" : "success"}
                      >
                        {formatMoney(fournisseur.creances)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCommercePage;
