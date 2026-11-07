import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type StatTone = "brand" | "success" | "warning" | "danger" | "neutral";

const tones: Record<StatTone, string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-gray-100 text-gray-600",
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
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-float",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-brand-soft/60 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
            {value}
          </div>
        </div>
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
              tones[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      {hint && <div className="relative mt-2 text-xs leading-relaxed text-muted">{hint}</div>}
    </motion.div>
  );
}
