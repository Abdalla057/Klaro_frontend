import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BarChart3, ChevronDown } from "lucide-react";
import {
  PERIODES_UI,
  STATUTS_ORDRE,
  STATUT_COULEUR,
  STATUT_LIBELLE,
  statutsParPeriode,
  type PeriodeUI,
} from "../../lib/dashboard";
import type { AbonnementAdmin } from "../../../../types/superAdmin";
import { ChartTooltip, IconBadge, Panel, PanelTitle } from "./Panel";

export function StatutsAbonnementsCard({ abonnements }: { abonnements: AbonnementAdmin[] }) {
  const [periode, setPeriode] = useState<PeriodeUI>("annee");
  const barres = useMemo(() => statutsParPeriode(abonnements, periode), [abonnements, periode]);
  const vide = barres.every((b) => b.total === 0);

  return (
    <Panel className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconBadge>
            <BarChart3 className="h-5 w-5" />
          </IconBadge>
          <PanelTitle className="truncate text-xl">Statistiques des abonnements</PanelTitle>
        </div>

        <label className="relative shrink-0">
          <span className="sr-only">Période</span>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as PeriodeUI)}
            className="h-9 cursor-pointer appearance-none rounded-xl bg-white py-1 pl-3 pr-8 text-sm text-muted outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pine/30"
          >
            {PERIODES_UI.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
        </label>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Légende">
        {STATUTS_ORDRE.map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUT_COULEUR[s] }} />
            {STATUT_LIBELLE[s]}
          </li>
        ))}
      </ul>

      <div className="relative mt-2 min-h-48 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={192}>
          <BarChart data={barres} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="14%">
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fontSize: 10, fill: "#8b9a95" }}
            />
            <Tooltip
              cursor={false}
              content={
                <ChartTooltip
                  titre={(p) => String(p.titre ?? "")}
                  format={(v) => String(v)}
                  exclure={["piste"]}
                />
              }
            />
            {STATUTS_ORDRE.map((statut) => (
              <Bar
                key={statut}
                dataKey={statut}
                name={STATUT_LIBELLE[statut]}
                stackId="statuts"
                fill={STATUT_COULEUR[statut]}
                maxBarSize={30}
                animationDuration={600}
              />
            ))}
            <Bar
              dataKey="piste"
              stackId="statuts"
              fill="#e3ecec"
              maxBarSize={30}
              radius={[10, 10, 0, 0]}
              legendType="none"
              tooltipType="none"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
        {vide && (
          <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-muted">
            Aucune souscription sur cette période.
          </p>
        )}
      </div>
    </Panel>
  );
}
