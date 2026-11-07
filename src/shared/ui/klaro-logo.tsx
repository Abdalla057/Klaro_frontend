import { cn } from "../utils/cn";

/**
 * KlaroMark
 *
 * Monogramme Klaro : un « K » blanc sur un carré arrondi vert, accompagné d'un
 * point d'accent. `variant="glass"` est prévu pour les fonds verts foncés
 * (sidebars) où le carré plein manquerait de contraste.
 */
export function KlaroMark({
  className = "h-10 w-10",
  variant = "solid",
}: {
  className?: string;
  variant?: "solid" | "glass";
}) {
  const solid = variant === "solid";

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="38.5"
        height="38.5"
        rx="11.5"
        fill={solid ? "#0C3B2E" : "rgba(255,255,255,0.12)"}
        stroke={solid ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.24)"}
        strokeWidth="1.5"
      />
      <path
        d="M13 11v18M13 20l10.5-9M13 20l10.5 9"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29.5" cy="11.5" r="2.8" fill={solid ? "#7BD3AE" : "#F9CF4A"} />
    </svg>
  );
}

/**
 * KlaroLogo
 *
 * Association du monogramme et du nom de marque, avec un sous-titre optionnel
 * (ex. « Espace client »). Utilisé dans les sidebars et la navigation publique.
 */
export function KlaroLogo({
  className,
  markClassName,
  subtitle,
  variant = "solid",
  subtitleClassName,
}: {
  className?: string;
  markClassName?: string;
  subtitle?: string;
  variant?: "solid" | "glass";
  subtitleClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <KlaroMark className={cn("h-9 w-9 shrink-0", markClassName)} variant={variant} />
      <span className="min-w-0 leading-tight">
        <span className="block text-lg font-semibold tracking-tight">Klaro</span>
        {subtitle && (
          <span
            className={cn(
              "block text-[10px] font-medium uppercase tracking-[0.18em] text-muted",
              subtitleClassName,
            )}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
