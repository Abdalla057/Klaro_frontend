import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type StatTone = "brand" | "success" | "warning" | "danger" | "neutral";

const tones: Record<StatTone, string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface text-muted",
};

/**
 * StatCard
 *
 * Affiche un indicateur clé (montant, nombre, statut) avec une hiérarchie
 * lisible : libellé discret, valeur forte, contexte secondaire et icône
 * colorée. L'entrée est animée une seule fois et l'ombre s'intensifie au survol.
 *
 * @param label   Libellé de l'indicateur.
 * @param value   Valeur principale (texte, nombre ou badge).
 * @param hint    Précision contextuelle affichée sous la valeur.
 * @param icon    Icône décorative affichée dans une pastille.
 * @param tone    Couleur sémantique de la pastille d'icône.
 * @param delay    Décalage de l'animation d'apparition, en secondes.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  delay = 0,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-card border border-border bg-white p-5 shadow-card transition-shadow duration-200 ease-klaro hover:shadow-float",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <div className="mt-2 text-kpi tabular-nums text-ink sm:text-[1.65rem]">{value}</div>
        </div>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.65rem]",
              tones[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      {hint && <div className="mt-2.5 text-xs leading-relaxed text-muted">{hint}</div>}
    </motion.div>
  );
}
