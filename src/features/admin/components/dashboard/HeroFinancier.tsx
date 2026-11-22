import { Link } from "react-router-dom";
import { ArrowRight, Building2, CreditCard, Layers, Receipt } from "lucide-react";
import { formatMoney, formatRelativeDate } from "../../../../shared/utils/format";
import type { StatistiquesFinancieres, TableauDeBord } from "../../../../types/superAdmin";
import { Panel, PanelTitle } from "./Panel";

const RACCOURCIS = [
  { to: "/admin/fournisseurs", label: "Fournisseurs", icon: Building2 },
  { to: "/admin/abonnements", label: "Abonnements", icon: CreditCard },
  { to: "/admin/plans", label: "Gérer les plans", icon: Layers },
  { to: "/admin/paiements", label: "Paiements", icon: Receipt },
];

function nombre(valeur: number | undefined) {
  return new Intl.NumberFormat("fr-FR").format(valeur ?? 0);
}

function CarteVerte({
  paiements,
  fournisseurs,
  abonnements,
  actualise,
}: {
  paiements: number;
  fournisseurs: number;
  abonnements: number;
  actualise: Date | null;
}) {
  return (
    <div className="mx-auto w-full max-w-[17rem] rounded-panel bg-pine-deep p-5 text-white shadow-card ring-1 ring-inset ring-white/10 sm:mx-0">
      <div className="flex items-center justify-between text-xs font-medium text-white/70">
        <span>Super Admin</span>
        <span className="text-sm font-semibold tracking-[-0.01em] text-white">Klaro</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { v: paiements, l: "Paiements" },
          { v: fournisseurs, l: "Fournisseurs" },
          { v: abonnements, l: "Abonnements" },
        ].map((item) => (
          <div key={item.l}>
            <p className="text-xl font-semibold leading-none tabular-nums">{nombre(item.v)}</p>
            <p className="mt-1.5 truncate text-[11px] text-white/70">{item.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/60">
        <span>Confirmés · actifs</span>
        <span>{actualise ? formatRelativeDate(actualise.toISOString()) : "…"}</span>
      </div>
    </div>
  );
}

export function HeroFinancier({
  tableau,
  finances,
  actualise,
}: {
  tableau: TableauDeBord | null;
  finances: StatistiquesFinancieres | null;
  actualise: Date | null;
}) {
  const devise = finances?.devise ?? "XOF";
  const autres = (finances?.devises ?? []).filter((d) => d.devise !== devise);

  return (
    <Panel className="p-6">
      <div>
        <PanelTitle className="text-[22px] tracking-[-0.025em] sm:text-3xl">Vue d'ensemble</PanelTitle>
        <p className="mt-1 text-[13px] text-muted">
          Votre activité, vos revenus et les actions à mener en un coup d'œil.
        </p>
      </div>

      <div className="mt-5 grid items-center gap-6 md:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_15rem]">
        <CarteVerte
          paiements={finances?.nombre_paiements_confirmes ?? 0}
          fournisseurs={tableau?.fournisseurs.actifs ?? 0}
          abonnements={tableau?.abonnements.actifs ?? 0}
          actualise={actualise}
        />

        <div className="min-w-0">
          <p className="text-[13px] text-muted">Chiffre d'affaires global</p>
          <p className="mt-1 break-words text-3xl font-semibold leading-tight tracking-[-0.03em] tabular-nums text-ink">
            {formatMoney(finances?.chiffre_affaires_total ?? 0)}
            <span className="ml-1.5 text-base font-medium text-muted">{devise}</span>
          </p>
          {autres.map((d) => (
            <p key={d.devise} className="mt-0.5 text-sm font-medium text-muted">
              + {formatMoney(d.chiffre_affaires_total, d.devise)}
            </p>
          ))}
          <Link
            to="/admin/paiements"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-pine-deep"
          >
            Voir les détails
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pine text-white">
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </Link>
        </div>

        <div className="md:col-span-2 xl:col-span-1">
          <p className="text-sm text-muted">Que souhaitez-vous faire ?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {RACCOURCIS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex min-h-[5.5rem] flex-col justify-between rounded-card border border-border/70 bg-mint/50 p-3.5 transition-all duration-200 ease-klaro hover:border-pine/20 hover:bg-mint"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-white transition-transform group-hover:scale-105">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-ink">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}
