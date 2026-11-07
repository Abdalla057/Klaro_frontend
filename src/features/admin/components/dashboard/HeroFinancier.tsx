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

/** Carte verte (clin d'œil à la carte bancaire de la référence) portant les 3 compteurs clés. */
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
    <div className="relative mx-auto w-full max-w-[17rem] pb-3 sm:mx-0">
      {/* Cartes empilées derrière */}
      <div className="absolute inset-x-3 bottom-0 top-8 rounded-2xl bg-[#f4c9c9]" />
      <div className="absolute inset-x-1.5 bottom-1.5 top-5 rounded-2xl bg-sun" />

      <div className="relative overflow-hidden rounded-2xl bg-pine p-4 text-white shadow-[0_14px_30px_-14px_rgba(40,110,90,0.7)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 300 180"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-25"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M-10 ${20 + i * 20} C 50 ${i * 20 - 5}, 100 ${50 + i * 20}, 160 ${25 + i * 20} S 260 ${i * 20 - 10}, 320 ${30 + i * 20}`}
              fill="none"
              stroke="#fff"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div className="relative">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="opacity-90">Super Admin</span>
            <span className="text-sm font-semibold tracking-wide">Klaro</span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { v: paiements, l: "Paiements" },
              { v: fournisseurs, l: "Fournisseurs" },
              { v: abonnements, l: "Abonnements" },
            ].map((item) => (
              <div key={item.l}>
                <p className="text-xl font-semibold leading-none">{nombre(item.v)}</p>
                <p className="mt-1 truncate text-[10px] text-white/75">{item.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-[10px] text-white/80">
            <span>Confirmés · actifs</span>
            <span>{actualise ? formatRelativeDate(actualise.toISOString()) : "…"}</span>
          </div>
        </div>
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
      <div className="flex flex-wrap items-baseline gap-x-3">
        <PanelTitle className="text-3xl">Vue d'ensemble</PanelTitle>
      </div>

      <div className="mt-5 grid items-center gap-6 md:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_15rem]">
        <CarteVerte
          paiements={finances?.nombre_paiements_confirmes ?? 0}
          fournisseurs={tableau?.fournisseurs.actifs ?? 0}
          abonnements={tableau?.abonnements.actifs ?? 0}
          actualise={actualise}
        />

        <div className="min-w-0">
          <p className="text-sm text-muted">Chiffre d'affaires global</p>
          <p className="mt-1 break-words text-3xl font-semibold leading-tight tracking-tight text-ink">
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
                className="group flex min-h-[5.5rem] flex-col justify-between rounded-[1.4rem] bg-sage p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d6e6e3]"
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
