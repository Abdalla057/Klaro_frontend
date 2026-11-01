import { Link, NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { BRAND } from "../../../shared/constants";
import { cn } from "../../../shared/utils/cn";
import { useAuth } from "../../../context/authContextCore";
import { logout } from "../../../services/authService";
import { useFournisseur } from "../context/fournisseurContextCore";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/fournisseur", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/fournisseur/clients", label: "Mes clients", icon: Users },
  { to: "/fournisseur/agents", label: "Agents", icon: UserRound },
  { to: "/fournisseur/encaissements", label: "Encaissements", icon: Wallet },
  { to: "/fournisseur/finances", label: "Finances", icon: Banknote },
  { to: "/fournisseur/abonnement", label: "Mon abonnement", icon: CreditCard },
  { to: "/fournisseur/profil", label: "Mon profil et paramètres", icon: Settings },
];

export function FournisseurSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profil } = useFournisseur();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();

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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link to="/fournisseur" onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <Wallet className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-ink">{BRAND}</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Espace fournisseur
          </p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-soft text-brand"
                    : "text-muted hover:bg-surface hover:text-ink",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-xl bg-surface px-3 py-2.5">
            <p className="truncate text-sm font-medium text-ink">
              {profil?.nom_entreprise ?? "Mon entreprise"}
            </p>
            <p className="truncate text-xs text-muted">
              {profil ? `Code ${profil.code_entreprise}` : "Chargement..."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
