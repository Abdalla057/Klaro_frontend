import { useEffect, useState, type ReactNode } from "react";
import { getApiError } from "../../../services/apiError";
import { getMonProfilClient } from "../../../services/clientService";
import { getMonSolde } from "../../../services/financeService";
import type { Client, SoldeClient } from "../../../types/fournisseur";
import { ClientContext } from "./clientContextCore";

export function ClientProvider({ children }: { children: ReactNode }) {
  const [profil, setProfil] = useState<Client | null>(null);
  const [solde, setSolde] = useState<SoldeClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getMonProfilClient(), getMonSolde()])
      .then(([profile, soldeData]) => {
        if (cancelled) return;

        if (!profile) {
          setError("Profil client introuvable. Contactez votre fournisseur.");
          return;
        }

        setProfil(profile);
        setSolde(soldeData);
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
    <ClientContext.Provider value={{ profil, solde, loading, error, refresh }}>
      {children}
    </ClientContext.Provider>
  );
}
