import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getApiError } from "../../../services/apiError";
import { getDemandesAdmin } from "../../../services/abonnementDemandeService";
import {
  getAllAbonnements,
  getAllFournisseursSupervision,
  getAllPaiements,
  getAllPlans,
  getStatistiquesFinancieres,
  getTableauDeBord,
} from "../../../services/superAdminService";
import type { DemandeAbonnement } from "../../../types/demandesAbonnement";
import type {
  AbonnementAdmin,
  FournisseurSupervision,
  PaiementAbonnement,
  PlanAbonnement,
  StatistiquesFinancieres,
  TableauDeBord,
} from "../../../types/superAdmin";
import { AdminDataContext } from "./adminContextCore";

const INTERVALLE_STATS = 60_000;
const INTERVALLE_LISTES = 300_000;
const DELAI_RETOUR = 30_000;

/**
 * Source unique des données du Super Admin : tableau de bord, finances et listes
 * (fournisseurs, abonnements, paiements, plans). Synchronisation automatique :
 * les indicateurs sont relus toutes les minutes ; dès qu'ils changent (ex. paiement
 * confirmé depuis une autre session) les listes sont relues immédiatement.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [tableau, setTableau] = useState<TableauDeBord | null>(null);
  const [finances, setFinances] = useState<StatistiquesFinancieres | null>(null);
  const [fournisseurs, setFournisseurs] = useState<FournisseurSupervision[]>([]);
  const [abonnements, setAbonnements] = useState<AbonnementAdmin[]>([]);
  const [paiements, setPaiements] = useState<PaiementAbonnement[]>([]);
  const [plans, setPlans] = useState<PlanAbonnement[]>([]);
  const [demandes, setDemandes] = useState<DemandeAbonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [version, setVersion] = useState(0);

  const actif = useRef(true);
  const signature = useRef<string | null>(null);
  const chargementEnCours = useRef(false);
  const dernierChargement = useRef(0);

  const chargerListes = useCallback(async () => {
    const [f, a, p, pl, d] = await Promise.allSettled([
      getAllFournisseursSupervision(),
      getAllAbonnements(),
      getAllPaiements(),
      getAllPlans(),
      getDemandesAdmin(),
    ]);
    if (!actif.current) return null;

    if (f.status === "fulfilled") setFournisseurs(f.value.items);
    if (a.status === "fulfilled") setAbonnements(a.value.items);
    if (p.status === "fulfilled") setPaiements(p.value.items);
    if (pl.status === "fulfilled") setPlans(pl.value.items);
    if (d.status === "fulfilled") setDemandes(d.value.items);

    const echec = [f, a, p, pl, d].find((r) => r.status === "rejected");
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
      if (chargementEnCours.current) return;
      chargementEnCours.current = true;
      dernierChargement.current = Date.now();
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
        chargementEnCours.current = false;
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

    const stats = window.setInterval(() => {
      if (chargementEnCours.current) return;
      chargementEnCours.current = true;
      dernierChargement.current = Date.now();
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
        } finally {
          chargementEnCours.current = false;
        }
      })();
    }, INTERVALLE_STATS);

    const listes = window.setInterval(() => {
      if (chargementEnCours.current) return;
      chargementEnCours.current = true;
      dernierChargement.current = Date.now();
      void chargerListes()
        .then((e) => {
          if (actif.current && e) setError(e);
        })
        .finally(() => {
          chargementEnCours.current = false;
        });
    }, INTERVALLE_LISTES);

    const surRetour = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - dernierChargement.current < DELAI_RETOUR) return;
      void refresh(true);
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
      demandes,
      loading,
      error,
      lastUpdated,
      version,
      refresh,
    }),
    [tableau, finances, fournisseurs, abonnements, paiements, plans, demandes, loading, error, lastUpdated, version, refresh],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
