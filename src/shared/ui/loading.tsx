import { cn } from "../utils/cn";

/**
 * Squelettes de chargement.
 *
 * Ils reprennent la forme et les espacements des composants réels afin
 * d'éviter les sauts de mise en page à l'arrivée des données. Le balayage
 * lumineux est désactivé automatiquement si l'utilisateur préfère réduire
 * les animations (règle globale dans index.css).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-lg bg-border/60",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent",
        className,
      )}
    />
  );
}

/** Squelette de tableau : lignes et colonnes alignées sur le rendu final. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Chargement du tableau">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn("h-4", columnIndex === 0 ? "w-1/3" : "flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Squelette de carte statistique. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-card",
        className,
      )}
      aria-busy="true"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-40" />
    </div>
  );
}
