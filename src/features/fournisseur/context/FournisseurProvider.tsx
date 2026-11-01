import { useEffect, useState, type ReactNode } from "react";
import { getApiError } from "../../../services/apiError";
import { getMonAbonnement, getMonProfil } from "../../../services/fournisseurService";
import type { Fournisseur, FournisseurAbonnement } from "../../../types/fournisseur";
import { FournisseurContext } from "./fournisseurContextCore";

export function FournisseurProvider({ children }: { children: ReactNode }) {
  const [profil, setProfil] = useState<Fournisseur | null>(null);
  const [abonnement, setAbonnement] = useState<FournisseurAbonnement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getMonProfil(), getMonAbonnement()])
      .then(([profile, subscription]) => {
        if (cancelled) return;

        if (!profile) {
          setError("Profil fournisseur introuvable. Contactez l'administrateur.");
          return;
        }

        setProfil(profile);
        setAbonnement(subscription);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshKey((key) => key + 1);
  };

  return (
    <FournisseurContext.Provider value={{ profil, abonnement, loading, error, refresh }}>
      {children}
    </FournisseurContext.Provider>
  );
}
