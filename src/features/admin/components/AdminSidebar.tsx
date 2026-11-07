import { Link, NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard, LayoutGrid, LogOut, Receipt, Layers, X } from "lucide-react";
import { BRAND } from "../../../shared/constants";
import { cn } from "../../../shared/utils/cn";
import { AdminLogo } from "./AdminLogo";

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutGrid, end: true },
  { to: "/admin/fournisseurs", label: "Fournisseurs", icon: Building2 },
  { to: "/admin/abonnements", label: "Abonnements", icon: CreditCard },
  { to: "/admin/plans", label: "Plans d'abonnement", icon: Layers },
  { to: "/admin/paiements", label: "Paiements", icon: Receipt },
];

/** Forme organique de la barre latérale (étirée sur toute la hauteur disponible). */
function FormeSidebar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 0 C34 3 100 8 100 24 L100 56 C100 70 66 74 70 83 C74 92 100 90 100 100 L0 100 Z"
        fill="#4a9a81"
      />
    </svg>
  );
}

/** Barre latérale desktop : icônes seules, page active dans un carré blanc arrondi. */
export function AdminSidebar() {
  return (
    <aside className="relative hidden w-24 shrink-0 lg:block" aria-label="Navigation principale">
      <Link
        to="/admin"
        aria-label={`${BRAND} — Vue d'ensemble`}
        className="absolute left-0 right-0 top-7 z-10 flex justify-center"
      >
        <AdminLogo className="h-11 w-11" />
      </Link>

      <FormeSidebar className="absolute inset-x-0 bottom-0 top-[22%] h-[78%] w-full" />

      <nav className="absolute inset-x-0 top-[38%] z-10 flex flex-col items-center gap-3">
        {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200",
                isActive
                  ? "bg-white text-pine shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]"
                  : "text-white/70 hover:bg-white/15 hover:text-white",
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full top-1/2 z-30 ml-4 -translate-y-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

/** Tiroir de navigation pour tablette et mobile. */
export function AdminMobileNav({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className={cn("lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
      <button
        type="button"
        aria-label="Fermer le menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col rounded-r-4xl bg-pine px-4 pb-5 pt-5 text-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Link to="/admin" onClick={onClose} className="flex items-center gap-3">
            <AdminLogo className="h-10 w-10" />
            <span>
              <span className="block text-lg font-semibold leading-tight">{BRAND}</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-white/70">
                Super Admin
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-xl p-2 text-white/80 hover:bg-white/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive ? "bg-white text-pine" : "text-white/80 hover:bg-white/15 hover:text-white",
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Déconnexion
        </button>
      </aside>
    </div>
  );
}
