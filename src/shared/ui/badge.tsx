import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

const tones: Record<BadgeTone, string> = {
  success: "bg-success-soft text-success ring-success/15",
  warning: "bg-warning-soft text-warning ring-warning/15",
  danger: "bg-danger-soft text-danger ring-danger/15",
  neutral: "bg-surface text-muted ring-border",
  brand: "bg-brand-soft text-brand ring-brand/15",
  info: "bg-info-soft text-info ring-info/15",
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs leading-5 font-medium ring-1 ring-inset transition-colors",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
