import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/**
 * SidebarNavLink
 *
 * Lien de navigation des sidebars vertes (fournisseur, agent, client).
 * L'état actif est signalé par une pastille blanche, une icône teintée et un
 * léger décalage de l'indicateur, ce qui rend la page courante immédiatement
 * identifiable.
 */
export function SidebarNavLink({
  item,
  onNavigate,
}: {
  item: SidebarNavItem;
  onNavigate?: () => void;
}) {
  const { to, label, icon: Icon, end } = item;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          isActive
            ? "bg-white text-brand shadow-sm"
            : "text-white/65 hover:bg-white/10 hover:text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-brand-soft text-brand"
                : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {isActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
          )}
        </>
      )}
    </NavLink>
  );
}

/** Titre de section discret à l'intérieur d'une sidebar. */
export function SidebarSectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
      {children}
    </p>
  );
}

/**
 * Pied de sidebar affichant l'utilisateur connecté.
 * `meta` permet d'ajouter une information contextuelle (zone, téléphone…).
 */
export function SidebarUserCard({
  initials,
  name,
  meta,
}: {
  initials: string;
  name: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/10">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-brand">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        {meta && <p className="truncate text-xs text-white/55">{meta}</p>}
      </div>
    </div>
  );
}
