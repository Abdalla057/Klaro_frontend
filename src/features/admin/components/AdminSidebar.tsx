import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CreditCard,
  FileClock,
  Layers,
  LayoutGrid,
  LogOut,
  Receipt,
  ShieldCheck,
  X,
} from "lucide-react";
import { BRAND } from "../../../shared/constants";
import { cn } from "../../../shared/utils/cn";
import { useAdminData } from "../context/adminContextCore";
import { AdminLogo } from "./AdminLogo";

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const ADMIN_NAV_GROUPS: { titre: string; items: NavItem[] }[] = [
  {
    titre: "Pilotage",
    items: [
      { to: "/admin", label: "Vue d'ensemble", icon: LayoutGrid, end: true },
      { to: "/admin/fournisseurs", label: "Fournisseurs", icon: Building2 },
    ],
  },
  {
    titre: "Abonnements",
    items: [
      { to: "/admin/demandes", label: "Demandes", icon: FileClock },
      { to: "/admin/abonnements", label: "Abonnements", icon: CreditCard },
      { to: "/admin/plans", label: "Plans", icon: Layers },
      { to: "/admin/paiements", label: "Paiements", icon: Receipt },
    ],
  },
];

function useDemandesATraiter() {
  const { demandes } = useAdminData();
  return useMemo(
    () => demandes.filter((d) => d.statut === "EN_ATTENTE" || d.statut === "EN_VERIFICATION").length,
    [demandes],
  );
}

function Compteur({ nombre, actif = false }: { nombre: number; actif?: boolean }) {
  if (nombre <= 0) return null;
  return (
    <span
      className={cn(
        "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
        actif ? "bg-white/20 text-white" : "bg-sun/35 text-pine-deep",
      )}
    >
      {nombre > 99 ? "99+" : nombre}
    </span>
  );
}

/** Barre latérale desktop : navigation complète, groupes et compteur de demandes. */
export function AdminSidebar() {
  const demandesATraiter = useDemandesATraiter();

  return (
    <aside
      className="relative hidden w-[16.5rem] shrink-0 flex-col border-r border-border/70 bg-white px-4 py-5 lg:flex"
      aria-label="Navigation principale"
    >
      <Link to="/admin" aria-label={`${BRAND} — Vue d'ensemble`} className="flex items-center gap-3 px-2 py-1">
        <AdminLogo className="h-10 w-10" />
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-tight tracking-tight text-ink">{BRAND}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Super admin
          </span>
        </span>
      </Link>

      <nav className="mt-8 flex-1 space-y-6">
        {ADMIN_NAV_GROUPS.map((groupe) => (
          <div key={groupe.titre}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/80">
              {groupe.titre}
            </p>
            <div className="mt-2 space-y-1">
              {groupe.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-pine text-white shadow-[0_10px_24px_-14px_rgba(26,71,59,0.9)]"
                        : "text-muted hover:bg-mint hover:text-ink",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "h-[1.15rem] w-[1.15rem] shrink-0 transition-colors",
                          isActive ? "text-white" : "text-muted group-hover:text-pine",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{label}</span>
                      {to === "/admin/demandes" && (
                        <Compteur nombre={demandesATraiter} actif={isActive} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-pine/10 bg-mint/60 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-pine shadow-sm">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink">Espace sécurisé</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Supervision complète des fournisseurs, abonnements et paiements.
        </p>
      </div>
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
  const demandesATraiter = useDemandesATraiter();

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
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-linear-to-b from-pine-deep to-pine px-4 pb-5 pt-5 text-white shadow-2xl transition-transform duration-300",
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

        <nav className="mt-8 flex-1 space-y-6 overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((groupe) => (
            <div key={groupe.titre}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                {groupe.titre}
              </p>
              <div className="mt-2 space-y-1">
                {groupe.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white text-pine-deep shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{label}</span>
                        {to === "/admin/demandes" && (
                          <Compteur nombre={demandesATraiter} actif={isActive} />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Déconnexion
        </button>
      </aside>
    </div>
  );
}
