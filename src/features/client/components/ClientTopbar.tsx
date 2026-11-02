import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Phone, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { useAuth } from "../../../context/authContextCore";
import { logout } from "../../../services/authService";
import { useClient } from "../context/clientContextCore";
import { clientFullName, clientInitials } from "../lib/dashboard";
import { compteClientStatus } from "../lib/status";

const PAGE_TITLES: Record<string, string> = {
  "/client": "Tableau de bord",
  "/client/solde": "Mon solde",
  "/client/demandes/nouvelle": "Demander un décaissement",
  "/client/demandes": "Mes demandes",
  "/client/transactions": "Historique des transactions",
  "/client/profil": "Mon profil",
};

export function ClientTopbar({ onMenu }: { onMenu: () => void }) {
  const { profil } = useClient();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizedPath = location.pathname.replace(/\/+$/, "") || "/client";
  const title = PAGE_TITLES[normalizedPath] ?? "Espace client";
  const fullName = clientFullName(profil);
  const initials = clientInitials(profil);
  const status = compteClientStatus(Boolean(profil?.compte_active));

  const handleLogout = () => {
    setMenuOpen(false);
    void logout();
    logoutLocal();
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur-xl">
      <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-border p-2 text-muted transition-colors hover:bg-surface hover:text-ink lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
              Espace client
            </p>
            <h1 className="truncate text-base font-semibold text-ink sm:text-lg">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted sm:inline-flex">
            <Phone className="h-3.5 w-3.5 text-brand-accent" aria-hidden="true" />
            {profil?.telephone ?? "—"}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-1.5 text-left transition-colors hover:border-border hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-44 truncate text-sm font-medium text-ink">
                  {fullName}
                </span>
                <span className="block truncate text-xs text-muted">{status.label}</span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 text-muted transition-transform", menuOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Fermer le menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-white py-1 shadow-xl">
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{fullName}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {profil?.telephone ?? "—"}
                    </p>
                  </div>
                  <div className="border-b border-border px-4 py-2.5">
                    <p
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        profil?.compte_active ? "text-emerald-600" : "text-amber-600",
                      )}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {status.label}
                    </p>
                  </div>
                  <Link
                    to="/client/profil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
                  >
                    <UserRound className="h-4 w-4 text-muted" aria-hidden="true" />
                    Mon profil
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
