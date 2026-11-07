import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContextCore";
import { getRoleHome } from "../../features/auth/lib/roleHome";

/**
 * Protège une branche de routes : redirige les visiteurs non connectés vers la
 * connexion (en mémorisant la page demandée) et les rôles non autorisés vers
 * leur espace d'accueil.
 */
export function RequireAuth({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }
  if (!allowedRoles.includes(user.role)) return <Navigate to={getRoleHome(user.role)} replace />;
  return <>{children}</>;
}

/**
 * Réserve une route aux visiteurs : un utilisateur déjà connecté est renvoyé
 * vers l'espace correspondant à son rôle.
 */
export function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated && user) return <Navigate to={getRoleHome(user.role)} replace />;
  return <>{children}</>;
}

export default RequireAuth;
