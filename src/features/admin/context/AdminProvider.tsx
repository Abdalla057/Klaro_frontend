import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getApiError } from "../../../services/apiError";
import {
  getAllAbonnements,
  getAllFournisseursSupervision,
  getAllPaiements,
  getAllPlans,
  getStatistiquesFinancieres,
  getTableauDeBord,
} from "../../../services/superAdminService";
import type {
  AbonnementAdmin,
  FournisseurSupervision,
  PaiementAbonnement,
  PlanAbonnement,
  StatistiquesFinancieres,
  TableauDeBord,
} from "../../../types/superAdmin";
import { AdminDataContext } from "./adminContextCore";

const INTERVALLE_STATS = 30_000;
const INTERVALLE_LISTES = 60_000;

/**
 * Source unique des données du Super Admin : tableau de bord, finances et listes
 * (fournisseurs, abonnements, paiements, plans). Synchronisation automatique :
 * les indicateurs sont relus toutes les 30 s ; dès qu'ils changent (ex. paiement
 * confirmé depuis une autre session) les listes sont relues immédiatement.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [tableau, setTableau] = useState<TableauDeBord | null>(null);
  const [finances, setFinances] = useState<StatistiquesFinancieres | null>(null);
  const [fournisseurs, setFournisseurs] = useState<FournisseurSupervision[]>([]);
  const [abonnements, setAbonnements] = useState<AbonnementAdmin[]>([]);
  const [paiements, setPaiements] = useState<PaiementAbonnement[]>([]);
  const [plans, setPlans] = useState<PlanAbonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [version, setVersion] = useState(0);

  const actif = useRef(true);
  const signature = useRef<string | null>(null);

  const chargerListes = useCallback(async () => {
    const [f, a, p, pl] = await Promise.allSettled([
      getAllFournisseursSupervision(),
      getAllAbonnements(),
      getAllPaiements(),
      getAllPlans(),
    ]);
    if (!actif.current) return null;

    if (f.status === "fulfilled") setFournisseurs(f.value.items);
    if (a.status === "fulfilled") setAbonnements(a.value.items);
    if (p.status === "fulfilled") setPaiements(p.value.items);
    if (pl.status === "fulfilled") setPlans(pl.value.items);

    const echec = [f, a, p, pl].find((r) => r.status === "rejected");
    return echec && echec.status === "rejected" ? getApiError(echec.reason).message : null;
  }, []);

  const chargerStats = useCallback(async () => {
    const [t, fin] = await Promise.all([getTableauDeBord(), getStatistiquesFinancieres()]);
    if (!actif.current) return false;
    setTableau(t);
    setFinances(fin);
    const nouvelle = JSON.stringify([t, fin]);
    const change = signature.current !== null && signature.current !== nouvelle;
    signature.current = nouvelle;
    return change;
  }, []);

  /** Synchronisation complète (statistiques + listes). */
  const refresh = useCallback(
    async (silencieux = true) => {
      if (!silencieux) setLoading(true);
      try {
        await chargerStats();
        const erreurListes = await chargerListes();
        if (!actif.current) return;
        setError(erreurListes);
        setLastUpdated(new Date());
        setVersion((v) => v + 1);
      } catch (err) {
        if (actif.current) setError(getApiError(err).message);
      } finally {
        if (actif.current) setLoading(false);
      }
    },
    [chargerListes, chargerStats],
  );

  useEffect(() => {
    actif.current = true;

    // Le chargement initial est planifié au tour suivant : cela évite une
    // cascade de setState pendant le montage tout en conservant l'indicateur
    // de chargement visible pour l'utilisateur.
    const premierChargement = window.setTimeout(() => {
      void refresh(false);
    }, 0);

    // Indicateurs : légers, relus souvent. Si quelque chose a changé, on relit les listes.
    const stats = window.setInterval(() => {
      void (async () => {
        try {
          const change = await chargerStats();
          if (!actif.current) return;
          if (change) {
            const erreurListes = await chargerListes();
            if (actif.current) setError(erreurListes);
          }
          if (actif.current) {
            setLastUpdated(new Date());
            setVersion((v) => v + 1);
          }
        } catch (err) {
          if (actif.current) setError(getApiError(err).message);
        }
      })();
    }, INTERVALLE_STATS);

    const listes = window.setInterval(() => {
      void chargerListes().then((e) => {
        if (actif.current && e) setError(e);
      });
    }, INTERVALLE_LISTES);

    const surRetour = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };
    window.addEventListener("focus", surRetour);
    document.addEventListener("visibilitychange", surRetour);

    return () => {
      actif.current = false;
      window.clearTimeout(premierChargement);
      window.clearInterval(stats);
      window.clearInterval(listes);
      window.removeEventListener("focus", surRetour);
      document.removeEventListener("visibilitychange", surRetour);
    };
  }, [chargerListes, chargerStats, refresh]);

  const value = useMemo(
    () => ({
      tableau,
      finances,
      fournisseurs,
      abonnements,
      paiements,
      plans,
      loading,
      error,
      lastUpdated,
      version,
      refresh,
    }),
    [tableau, finances, fournisseurs, abonnements, paiements, plans, loading, error, lastUpdated, version, refresh],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
