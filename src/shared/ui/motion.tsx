import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { EASE_OUT } from "./motion-tokens";

/**
 * Primitives d'animation partagées.
 *
 * Les animations ne reposent que sur `opacity` et `transform` afin de rester
 * performantes (composited properties). `useReducedMotion` désactive les
 * mouvements pour les utilisateurs ayant activé la préférence système.
 */

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE_OUT },
  },
};

/** Apparition douce d'un bloc au montage, avec délai optionnel. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, delay, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Conteneur qui orchestre l'apparition en cascade de ses enfants.
 * Utiliser avec `StaggerItem` pour animer une grille de cartes.
 */
export function Stagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.055, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Élément enfant d'un `Stagger`. */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div className={cn(className)} variants={reduce ? undefined : itemVariants}>
      {children}
    </motion.div>
  );
}
