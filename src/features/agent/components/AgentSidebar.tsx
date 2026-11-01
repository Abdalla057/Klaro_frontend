import { Link, NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Banknote,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { BRAND } from "../../../shared/constants";
import { cn } from "../../../shared/utils/cn";
import { useAuth } from "../../../context/authContextCore";
import { logout } from "../../../services/authService";
import { useAgent } from "../context/agentContextCore";
import { agentFullName, agentInitials } from "../lib/dashboard";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/agent", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/agent/encaissements", label: "Encaissements", icon: Wallet },
  { to: "/agent/decaissements", label: "Décaissements", icon: Banknote },
  { to: "/agent/clients", label: "Clients", icon: Users },
  { to: "/agent/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/agent/profil", label: "Mon profil", icon: Settings },
];

export function AgentSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profil } = useAgent();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();
  const fullName = agentFullName(profil);
  const initials = agentInitials(profil);

  const handleLogout = () => {
    void logout();
    logoutLocal();
    navigate("/auth/login", { replace: true });
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand text-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative flex h-20 items-center overflow-hidden border-b border-white/10 px-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-12 h-24 w-24 rounded-full bg-brand-accent/30 blur-xl" />
          <Link to="/agent" onClick={onClose} className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
              <Wallet className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">{BRAND}</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                Espace agent
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Pilotage terrain
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
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
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-inset ring-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-brand">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{fullName}</p>
              <p className="truncate text-xs text-white/55">
                {profil?.zone || "Agent d'encaissement"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-red-500/15 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
