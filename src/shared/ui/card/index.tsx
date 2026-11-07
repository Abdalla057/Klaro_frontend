import * as React from "react";
import { cn } from "../../utils/cn";

/**
 * Card
 *
 * Conteneur de surface standard : fond blanc, bordure douce et ombre discrète.
 * Sert de base aux panneaux de contenu, formulaires et listes.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-white shadow-card", className)}
      {...props}
    />
  );
}

export default Card;
