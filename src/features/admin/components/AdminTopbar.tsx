import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  CreditCard,
  History,
  LogOut,
  Menu,
  Receipt,
  Search,
} from "lucide-react";
import { useAuth } from "../../../context/authContextCore";
import { cn } from "../../../shared/utils/cn";
import { useAdminData } from "../context/adminContextCore";
import { calculerAlertes } from "../lib/dashboard";

function useFermetureExterieure(ouvert: boolean, fermer: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const surClic = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) fermer();
    };
    const surTouche = (event: KeyboardEvent) => {
      if (event.key === "Escape") fermer();
    };
    document.addEventListener("mousedown", surClic);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("mousedown", surClic);
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert, fermer]);
  return ref;
}

const normaliser = (valeur: string) =>
  valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

type ResultatRecherche = { id: string; titre: string; detail: string; to: string; icone: ReactNode };

function RechercheGlobale() {
  const { fournisseurs, abonnements, paiements } = useAdminData();
  const navigate = useNavigate();
  const [requete, setRequete] = useState("");
  const [ouvert, setOuvert] = useState(false);
  const ref = useFermetureExterieure(ouvert, () => setOuvert(false));

  const groupes = useMemo(() => {
    const q = normaliser(requete.trim());
    if (q.length < 2) return [];
    const contient = (...champs: (string | undefined | null)[]) =>
      champs.some((c) => c && normaliser(c).includes(q));

    const f: ResultatRecherche[] = fournisseurs
      .filter((x) => contient(x.nom_entreprise, x.code_entreprise, x.telephone))
      .slice(0, 4)
      .map((x) => ({
        id: `f-${x.id}`,
        titre: x.nom_entreprise,
        detail: `${x.code_entreprise} · ${x.telephone}`,
        to: `/admin/fournisseurs?q=${encodeURIComponent(x.nom_entreprise)}`,
        icone: <Building2 className="h-4 w-4" />,
      }));

    const a: ResultatRecherche[] = abonnements
      .filter((x) => contient(x.fournisseur.nom_entreprise, x.plan.nom, x.reference_paiement))
      .slice(0, 4)
      .map((x) => ({
        id: `a-${x.id}`,
        titre: x.fournisseur.nom_entreprise,
        detail: `Plan ${x.plan.nom}`,
        to: `/admin/abonnements?q=${encodeURIComponent(x.fournisseur.nom_entreprise)}`,
        icone: <CreditCard className="h-4 w-4" />,
      }));

    const p: ResultatRecherche[] = paiements
      .filter((x) => contient(x.reference, x.reference_transaction, x.fournisseur.nom_entreprise))
      .slice(0, 4)
      .map((x) => ({
        id: `p-${x.id}`,
        titre: x.reference,
        detail: x.fournisseur.nom_entreprise,
        to: `/admin/paiements?q=${encodeURIComponent(x.reference)}`,
        icone: <Receipt className="h-4 w-4" />,
      }));

    return [
      { titre: "Fournisseurs", items: f },
      { titre: "Abonnements", items: a },
      { titre: "Paiements", items: p },
    ].filter((g) => g.items.length);
  }, [requete, fournisseurs, abonnements, paiements]);

  const aller = (to: string) => {
    setOuvert(false);
    setRequete("");
    navigate(to);
  };

  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <label className="flex h-11 items-center gap-3 rounded-2xl bg-panel px-4 text-sm text-muted transition-shadow focus-within:ring-2 focus-within:ring-pine/25">
        <Search className="h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
        <input
          type="search"
          value={requete}
          onChange={(e) => {
            setRequete(e.target.value);
            setOuvert(true);
          }}
          onFocus={() => setOuvert(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && groupes[0]) aller(groupes[0].items[0].to);
          }}
          placeholder="Rechercher un fournisseur, un abonnement, un paiement…"
          aria-label="Recherche globale"
          className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted/80 [&::-webkit-search-cancel-button]:hidden"
        />
      </label>

      {ouvert && requete.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl">
          {groupes.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted">Aucun résultat pour « {requete.trim()} »</p>
          ) : (
            groupes.map((groupe) => (
              <div key={groupe.titre} className="py-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {groupe.titre}
                </p>
                {groupe.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => aller(item.to)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-panel"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sage text-pine">
                      {item.icone}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{item.titre}</span>
                      <span className="block truncate text-xs text-muted">{item.detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const boutonIcone =
  "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-panel text-ink transition-colors hover:bg-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/30";

function Notifications() {
  const { abonnements, paiements, fournisseurs } = useAdminData();
  const [ouvert, setOuvert] = useState(false);
  const ref = useFermetureExterieure(ouvert, () => setOuvert(false));
  const alertes = useMemo(
    () => calculerAlertes(abonnements, paiements, fournisseurs),
    [abonnements, paiements, fournisseurs],
  );
  const total = alertes.reduce((somme, a) => somme + a.nombre, 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={boutonIcone}
        aria-label={`Notifications${total ? ` (${total})` : ""}`}
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
      >
        <Bell className="h-4.5 w-4.5" />
        {total > 0 && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-sun ring-2 ring-panel" />}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[85vw] rounded-2xl border border-border bg-white p-2 shadow-xl">
          <p className="px-3 py-2 text-sm font-semibold text-ink">Notifications</p>
          {alertes.length === 0 ? (
            <p className="px-3 pb-4 text-sm text-muted">Rien à signaler pour le moment.</p>
          ) : (
            alertes.map((alerte) => (
              <Link
                key={alerte.id}
                to={alerte.to}
                onClick={() => setOuvert(false)}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-panel"
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                    alerte.niveau === "danger" && "bg-red-100 text-red-700",
                    alerte.niveau === "warning" && "bg-amber-100 text-amber-700",
                    alerte.niveau === "info" && "bg-sage text-pine-deep",
                  )}
                >
                  {alerte.nombre}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{alerte.titre}</span>
                  <span className="block text-xs text-muted">{alerte.detail}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProfilMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const ref = useFermetureExterieure(ouvert, () => setOuvert(false));
  const libelle = user?.telephone ?? "Super admin";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label="Menu du profil"
        className="flex h-11 items-center gap-2.5 rounded-2xl bg-panel pl-4 pr-1.5 transition-colors hover:bg-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/30"
      >
        <span className="hidden max-w-36 truncate text-sm font-medium text-ink sm:block">{libelle}</span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted sm:block" aria-hidden="true" />
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pine text-xs font-semibold text-white">
          SA
        </span>
      </button>

      {ouvert && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{libelle}</p>
            <p className="text-xs text-muted">{user?.role_display ?? "Super administrateur"}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminTopbar({ onMenu, onLogout }: { onMenu: () => void; onLogout: () => void }) {
  return (
    <header className="flex shrink-0 items-center gap-2.5 px-4 pb-3 pt-4 sm:gap-3 sm:px-6 lg:pl-8 lg:pr-8 lg:pt-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Ouvrir le menu"
        className={cn(boutonIcone, "lg:hidden")}
      >
        <Menu className="h-5 w-5" />
      </button>

      <RechercheGlobale />

      <Link to="/admin/paiements" aria-label="Historique des transactions" title="Historique des transactions" className={cn(boutonIcone, "hidden sm:flex")}>
        <History className="h-4.5 w-4.5" />
      </Link>
      <Notifications />
      <ProfilMenu onLogout={onLogout} />
    </header>
  );
}
