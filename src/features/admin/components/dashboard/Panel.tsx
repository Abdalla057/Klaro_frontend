import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../../../shared/utils/cn";

/** Carte arrondie gris très clair, brique de base du dashboard. */
export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
}) {
  return <Tag className={cn("min-w-0 rounded-[1.75rem] bg-panel p-5", className)}>{children}</Tag>;
}

export function PanelTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-xl font-semibold tracking-tight text-ink", className)}>{children}</h2>;
}

/** Pastille verte arrondie portant une icône (Income / Expenses… de la référence). */
export function IconBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Lien « Voir tout ↗ » avec pastille verte. */
export function SeeAll({ to, label = "Voir tout" }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-ink transition-colors hover:text-pine-deep"
    >
      {label}
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pine text-white transition-transform group-hover:scale-110">
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Contrôle segmenté Semaine / Mois / Année (style de la référence). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex items-center gap-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
            option.value === value ? "bg-sage text-ink" : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Info-bulle des graphiques : pastille verte profonde avec le montant. */
export function ChartTooltip({
  active,
  payload,
  titre,
  format,
  libelle = "Valeur",
  exclure = [],
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    value?: number | string;
    dataKey?: string | number;
    payload?: Record<string, unknown>;
    name?: string;
    color?: string;
  }>;
  titre?: (p: Record<string, unknown>) => string;
  format: (valeur: number, nom?: string) => string;
  libelle?: string;
  exclure?: string[];
}) {
  const lignes = (payload ?? []).filter((l) => !exclure.includes(String(l.dataKey)));
  if (!active || !lignes.length) return null;
  const premier = lignes[0]?.payload ?? {};
  return (
    <div className="rounded-2xl bg-ink px-3.5 py-2.5 text-xs text-white shadow-xl">
      {titre && <p className="mb-1 font-medium text-white/70">{titre(premier)}</p>}
      {lignes.map((ligne, index) => (
        <p key={index} className="flex items-center gap-2 font-semibold">
          {ligne.color && (
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ligne.color }} />
          )}
          <span className="font-normal text-white/70">{ligne.name ?? libelle}</span>
          {format(Number(ligne.value ?? 0), ligne.name)}
        </p>
      ))}
    </div>
  );
}
