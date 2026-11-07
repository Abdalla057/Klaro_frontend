import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "../../../../shared/ui/badge";
import { cn } from "../../../../shared/utils/cn";
import { formatDate, formatMoney } from "../../../../shared/utils/format";
import type {
  AbonnementStatut,
  FournisseurSupervision,
  PaiementAbonnement,
} from "../../../../types/superAdmin";
import { abonnementStatus, TYPE_OPERATION } from "../../lib/status";
import { statutAbonnement, type AlerteAdmin } from "../../lib/dashboard";
import { Panel, PanelTitle, SeeAll } from "./Panel";

const NB_LIGNES = 3;

function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase())
    .join("");
}

/** Avancement de l'abonnement dans sa durée (0 → 100 %). */
function avancement(debut: string, fin: string) {
  const d = new Date(debut).getTime();
  const f = new Date(fin).getTime();
  if (Number.isNaN(d) || Number.isNaN(f) || f <= d) return 0;
  return Math.min(100, Math.max(0, ((Date.now() - d) / (f - d)) * 100));
}

/* ------------------------------------------------------------------ */

export function FournisseursRecentsCard({ fournisseurs }: { fournisseurs: FournisseurSupervision[] }) {
  const recents = useMemo(() => {
    const date = (f: FournisseurSupervision) =>
      Math.max(
        new Date(f.date_creation).getTime() || 0,
        f.abonnement ? new Date(f.abonnement.date_debut).getTime() || 0 : 0,
      );
    return [...fournisseurs].sort((a, b) => date(b) - date(a)).slice(0, NB_LIGNES);
  }, [fournisseurs]);

  return (
    <Panel className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PanelTitle className="text-xl">Fournisseurs</PanelTitle>
        <SeeAll to="/admin/fournisseurs" label="Liste" />
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {recents.length === 0 ? (
          <p className="rounded-2xl bg-sage/60 p-4 text-sm text-muted">Aucun fournisseur inscrit pour le moment.</p>
        ) : (
          recents.map((f) => {
            const ab = f.abonnement;
            const statut: AbonnementStatut | null = ab ? statutAbonnement(ab) : null;
            const config = statut ? abonnementStatus(statut) : null;
            return (
              <Link
                key={f.id}
                to={`/admin/fournisseurs?q=${encodeURIComponent(f.nom_entreprise)}`}
                className="block rounded-2xl bg-sage/70 p-3 transition-colors hover:bg-sage"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-ink">{f.nom_entreprise}</p>
                  {config ? (
                    <Badge tone={config.tone} className="shrink-0 px-2 py-0.5 text-[10px]">
                      {config.label}
                    </Badge>
                  ) : (
                    <Badge tone="neutral" className="shrink-0 px-2 py-0.5 text-[10px]">
                      Sans abonnement
                    </Badge>
                  )}
                </div>
                {ab ? (
                  <>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      Plan {ab.plan_nom} · depuis le {formatDate(ab.date_debut)}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                      <div
                        className="h-full rounded-full bg-sun transition-[width] duration-700"
                        style={{ width: `${avancement(ab.date_debut, ab.date_fin)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">Expire le {formatDate(ab.date_fin)}</p>
                  </>
                ) : (
                  <p className="mt-0.5 text-xs text-muted">Inscrit le {formatDate(f.date_creation)}</p>
                )}
              </Link>
            );
          })
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

const STATUT_PAIEMENT: Record<string, { label: string; classe: string }> = {
  CONFIRME: { label: "Confirmé", classe: "text-muted" },
  EN_ATTENTE: { label: "En attente", classe: "text-amber-600" },
  REFUSE: { label: "Refusé", classe: "text-red-600" },
  ANNULE: { label: "Annulé", classe: "text-muted line-through" },
};

export function DernieresTransactionsCard({ paiements }: { paiements: PaiementAbonnement[] }) {
  const dernieres = useMemo(
    () =>
      [...paiements]
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
        .slice(0, NB_LIGNES),
    [paiements],
  );

  return (
    <Panel className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <PanelTitle className="text-xl">Dernières transactions</PanelTitle>
        <Link
          to="/admin/paiements"
          aria-label="Historique complet des paiements"
          title="Historique complet"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-sage"
        >
          <ArrowDownUp className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-3 flex-1 divide-y divide-border/70">
        {dernieres.length === 0 ? (
          <p className="py-6 text-sm text-muted">Aucune transaction enregistrée pour le moment.</p>
        ) : (
          dernieres.map((p) => {
            const statut = STATUT_PAIEMENT[p.statut] ?? { label: p.statut_display, classe: "text-muted" };
            const date = p.date_confirmation ?? p.date_creation;
            return (
              <Link
                key={p.id}
                to={`/admin/paiements?q=${encodeURIComponent(p.reference)}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 transition-colors hover:bg-white/50 sm:grid-cols-[9rem_1fr_auto]"
              >
                <p className="order-3 col-span-2 text-xs leading-snug text-muted sm:order-none sm:col-span-1">
                  {formatDate(date, true)}
                </p>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-pine-deep">
                    {initiales(p.fournisseur.nom_entreprise)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{p.fournisseur.nom_entreprise}</p>
                    <p className="truncate text-xs text-muted">
                      {TYPE_OPERATION[p.type_operation] ?? p.type_operation} · {p.reference}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      p.statut === "CONFIRME" ? "text-ink" : "text-muted",
                    )}
                  >
                    +{formatMoney(p.montant, p.devise)}
                  </p>
                  <p className={cn("text-xs", statut.classe)}>{statut.label}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */

const COULEUR_ALERTE = {
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-white text-pine-deep",
} as const;

export function AlertesCard({ alertes }: { alertes: AlerteAdmin[] }) {
  return (
    <Panel className="flex flex-col">
      <PanelTitle className="text-xl">Alertes</PanelTitle>
      <p className="mt-1 text-xs text-muted">Ce qui demande votre attention</p>

      {alertes.length === 0 ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-sage/60 px-4 py-8 text-center">
          <CheckCircle2 className="h-9 w-9 text-pine" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">Tout est en ordre</p>
          <p className="text-xs text-muted">Aucune alerte en cours.</p>
        </div>
      ) : (
        <ul className="mt-3 flex-1 space-y-2">
          {alertes.map((a) => (
            <li key={a.id}>
              <Link
                to={a.to}
                className="group flex items-center gap-3 rounded-2xl bg-sage/70 p-3 transition-colors hover:bg-sage"
              >
                <span
                  className={cn(
                    "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold",
                    COULEUR_ALERTE[a.niveau],
                  )}
                >
                  {a.nombre}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-ink">{a.titre}</span>
                  <span className="block text-[11px] leading-snug text-muted">{a.detail}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
