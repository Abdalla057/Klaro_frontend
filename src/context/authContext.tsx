import { useEffect, useState } from "react";
import type { Utilisateur } from "../types/auth";
import { storage } from "../utils/storage";
import { me } from "../services/authService";
import { AuthContext } from "./authContextCore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<Utilisateur | null>(() =>
    storage.getAccessToken() ? storage.getUser<Utilisateur>() : null,
  );
  const [loading, setLoading] = useState(() => Boolean(storage.getAccessToken()));

  useEffect(() => {
    const token = storage.getAccessToken();

    if (!token) return;

    let cancelled = false;

    me()
      .then((currentUser) => {
        if (!cancelled) setUserState(currentUser);
      })
      .catch(() => {
        if (!cancelled) {
          storage.clearTokens();
          setUserState(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setUser = (nextUser: Utilisateur | null) => {
    setUserState(nextUser);
    if (nextUser) storage.setUser(nextUser);
    else storage.clearTokens();
  };

  const logoutLocal = () => {
    storage.clearTokens();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser, logoutLocal }}>
      {children}
    </AuthContext.Provider>
  );
}
