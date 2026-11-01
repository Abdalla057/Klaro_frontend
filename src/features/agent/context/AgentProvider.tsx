import { useEffect, useState, type ReactNode } from "react";
import { getApiError } from "../../../services/apiError";
import { getMonProfilAgent } from "../../../services/agentService";
import type { Agent } from "../../../types/fournisseur";
import { AgentContext } from "./agentContextCore";

export function AgentProvider({ children }: { children: ReactNode }) {
  const [profil, setProfil] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getMonProfilAgent()
      .then((profile) => {
        if (cancelled) return;

        if (!profile) {
          setError("Profil agent introuvable. Contactez votre fournisseur.");
          return;
        }

        setProfil(profile);
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
    <AgentContext.Provider value={{ profil, loading, error, refresh }}>
      {children}
    </AgentContext.Provider>
  );
}
