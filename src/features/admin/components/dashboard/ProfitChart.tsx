import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatMoney } from "../../../../shared/utils/format";
import { PERIODES_UI, type PeriodeUI, type PointCA } from "../../lib/dashboard";
import { cn } from "../../../../shared/utils/cn";
import { ChartTooltip, Panel, PanelTitle, Segmented, SeeAll } from "./Panel";

export function ChiffreAffairesPanel({
  points,
  periode,
  onPeriodeChange,
  devise,
  devises,
  onDeviseChange,
  chargement,
}: {
  points: PointCA[];
  periode: PeriodeUI;
  onPeriodeChange: (p: PeriodeUI) => void;
  devise: string;
  devises: string[];
  onDeviseChange: (d: string) => void;
  chargement: boolean;
}) {
  const gradient = useId();
  const total = points.reduce((somme, p) => somme + p.montant, 0);
  const sansDonnees = points.length === 0 || points.every((p) => p.montant === 0);

  return (
    <Panel className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <PanelTitle className="text-xl">Chiffre d'affaires</PanelTitle>
        <SeeAll to="/admin/paiements" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Segmented options={PERIODES_UI} value={periode} onChange={onPeriodeChange} label="Période du chiffre d'affaires" />
        {devises.length > 1 && (
          <div className="flex items-center gap-1" role="group" aria-label="Devise">
            {devises.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onDeviseChange(d)}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                  d === devise ? "bg-sun/70 text-ink" : "text-muted hover:text-ink",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Total de la période : <span className="font-semibold text-ink">{formatMoney(total, devise)}</span>
      </p>

      <div className={cn("relative mt-2 min-h-44 flex-1 transition-opacity", chargement && "opacity-60")}>
        {sansDonnees ? (
          <div className="flex h-full min-h-44 items-center justify-center rounded-2xl border border-dashed border-pine/25 px-4 text-center text-sm text-muted">
            Aucun paiement confirmé sur cette période.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={176}>
            <AreaChart data={points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4a9a81" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4a9a81" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={14}
                tick={{ fontSize: 11, fill: "#8b9a95" }}
              />
              <Tooltip
                cursor={{ stroke: "#4a9a81", strokeDasharray: "3 3" }}
                content={
                  <ChartTooltip
                    titre={(p) => String(p.titre ?? "")}
                    format={(v) => formatMoney(v, devise)}
                    libelle="Revenus"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="montant"
                name="Revenus"
                stroke="#3b8069"
                strokeWidth={2}
                fill={`url(#${gradient})`}
                activeDot={{ r: 5, fill: "#3b8069", stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Panel>
  );
}
