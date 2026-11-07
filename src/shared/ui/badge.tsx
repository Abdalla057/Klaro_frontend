import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

const tones: Record<BadgeTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  neutral: "bg-gray-100 text-gray-600 ring-gray-500/10",
  brand: "bg-brand-soft text-brand ring-brand/15",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

/**
 * Badge
 *
 * Pastille de statut compacte. Le ton doit refléter l'état métier réel
 * (succès, avertissement, erreur, information) et non l'esthétique.
 */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
