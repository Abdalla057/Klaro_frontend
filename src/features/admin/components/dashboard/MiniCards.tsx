import { useId, type ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDown, ArrowUp, CreditCard, Wallet } from "lucide-react";
import { cn } from "../../../../shared/utils/cn";
import { formatMoney } from "../../../../shared/utils/format";
import type { PointCA } from "../../lib/dashboard";
import type { StatistiquesAbonnements } from "../../../../types/superAdmin";
import { ChartTooltip, IconBadge, Panel, PanelTitle } from "./Panel";

function Sparkline({
  data,
  cle,
  nom,
  format,
  vide,
}: {
  data: Record<string, unknown>[];
  cle: string;
  nom: string;
  format: (v: number) => string;
  vide: string;
}) {
  const gradient = useId();
  const utile = data.length > 1 && data.some((d) => Number(d[cle]) > 0);

  return (
    <div className="h-24 w-full">
      {utile ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a9a81" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#4a9a81" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={false}
              content={<ChartTooltip titre={(p) => String(p.titre ?? "")} format={format} libelle={nom} />}
            />
            <Area
              type="monotone"
              dataKey={cle}
              name={nom}
              stroke="#3b8069"
              strokeWidth={2}
              fill={`url(#${gradient})`}
              activeDot={{ r: 4, fill: "#3b8069", stroke: "#fff", strokeWidth: 2 }}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-center text-xs text-muted">{vide}</div>
      )}
    </div>
  );
}

function Variation({ valeur }: { valeur: number | null }) {
  if (valeur === null) return null;
  const hausse = valeur >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium",
        hausse ? "bg-[#d9efd2] text-[#3d7a35]" : "bg-[#f6ded6] text-[#a8553a]",
      )}
      title="Variation par rapport à la période précédente"
    >
      {hausse ? "+" : ""}
      {valeur.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%
      {hausse ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
    </span>
  );
}

function EnteteCarte({ icone, titre, sousTitre }: { icone: ReactNode; titre: string; sousTitre: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconBadge>{icone}</IconBadge>
      <div className="min-w-0">
        <PanelTitle className="truncate text-xl">{titre}</PanelTitle>
        <p className="-mt-0.5 text-xs text-muted">{sousTitre}</p>
      </div>
    </div>
  );
}

export function RevenusCard({
  points,
  montant,
  devise,
  evolution,
}: {
  points: PointCA[];
  montant: string | null;
  devise: string;
  evolution: number | null;
}) {
  return (
    <Panel className="flex flex-col justify-between">
      <EnteteCarte icone={<Wallet className="h-5 w-5" />} titre="Revenus" sousTitre="Ce mois-ci" />
      <div className="mt-3">
        <Sparkline
          data={points as unknown as Record<string, unknown>[]}
          cle="montant"
          nom="Revenus"
          format={(v) => formatMoney(v, devise)}
          vide="Pas encore de revenus ce mois-ci"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <p className="text-xl font-semibold tracking-tight text-ink">{formatMoney(montant ?? 0, devise)}</p>
        <Variation valeur={evolution} />
      </div>
    </Panel>
  );
}

export function AbonnementsCard({ stats }: { stats: StatistiquesAbonnements | null }) {
  const points = (stats?.points ?? []).map((p) => ({
    ...p,
    titre: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(
      new Date(`${p.date.slice(0, 10)}T00:00:00`),
    ),
  }));

  return (
    <Panel className="flex flex-col justify-between">
      <EnteteCarte icone={<CreditCard className="h-5 w-5" />} titre="Abonnements" sousTitre="Ce mois-ci" />
      <div className="mt-3">
        <Sparkline
          data={points as unknown as Record<string, unknown>[]}
          cle="total_abonnements"
          nom="Total"
          format={(v) => `${v.toLocaleString("fr-FR")} abonnement(s)`}
          vide="Pas encore de données"
        />
      </div>
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <p className="text-xl font-semibold tracking-tight text-ink">
            {stats?.statuts.actifs ?? 0} <span className="text-sm font-medium text-muted">actifs</span>
          </p>
          <span className="inline-flex rounded-lg bg-[#d9efd2] px-2 py-1 text-xs font-medium text-[#3d7a35]">
            +{stats?.periode_courante.nouvelles_souscriptions ?? 0} nouv.
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {stats?.periode_courante.renouvellements ?? 0} renouvellement(s) sur la période
        </p>
      </div>
    </Panel>
  );
}
