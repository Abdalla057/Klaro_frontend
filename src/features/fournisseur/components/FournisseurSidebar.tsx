import { Link, useNavigate } from "react-router-dom";
import {
  Banknote,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { useAuth } from "../../../context/authContextCore";
import { logout } from "../../../services/authService";
import { KlaroLogo } from "../../../shared/ui/klaro-logo";
import {
  SidebarNavLink,
  SidebarSectionLabel,
  SidebarUserCard,
  type SidebarNavItem,
} from "../../../shared/ui/sidebar-nav";
import { useFournisseur } from "../context/fournisseurContextCore";

const NAV_ITEMS: SidebarNavItem[] = [
  { to: "/fournisseur", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/fournisseur/clients", label: "Mes clients", icon: Users },
  { to: "/fournisseur/agents", label: "Agents", icon: UserRound },
  { to: "/fournisseur/encaissements", label: "Encaissements", icon: Wallet },
  { to: "/fournisseur/finances", label: "Finances", icon: Banknote },
  { to: "/fournisseur/abonnement", label: "Mon abonnement", icon: CreditCard },
  { to: "/fournisseur/profil", label: "Mon profil et paramètres", icon: Settings },
];

/**
 * FournisseurSidebar
 *
 * Navigation de l'espace fournisseur. Elle partage désormais la même identité
 * visuelle que les espaces agent et client (fond vert profond, pastille active
 * blanche) pour donner une cohérence de marque à tous les dashboards.
 */
export function FournisseurSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profil } = useFournisseur();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();

  const initials = profil?.nom_entreprise?.trim().slice(0, 2).toUpperCase() || "F";

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
        aria-label="Navigation principale fournisseur"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand text-white shadow-sidebar transition-transform duration-300 ease-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative flex h-20 items-center justify-between overflow-hidden border-b border-white/10 px-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-12 h-24 w-24 rounded-full bg-brand-accent/30 blur-xl" />
          <Link to="/fournisseur" onClick={onClose} className="relative">
            <KlaroLogo
              variant="glass"
              subtitle="Espace fournisseur"
              subtitleClassName="text-white/50"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="relative rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <SidebarSectionLabel>Gestion de l'activité</SidebarSectionLabel>
          {NAV_ITEMS.map((item) => (
            <SidebarNavLink key={item.to} item={item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-2">
            <SidebarUserCard
              initials={initials}
              name={profil?.nom_entreprise ?? "Mon entreprise"}
              meta={profil ? `Code ${profil.code_entreprise}` : "Chargement..."}
            />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-red-500/15 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
