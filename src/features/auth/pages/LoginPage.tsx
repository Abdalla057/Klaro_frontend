import { Link, useLocation } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { LoginForm } from "../components/LoginForm";
import { AuthAlert } from "../components/AuthAlert";

/**
 * LoginPage
 *
 * Point d'entrée commun aux fournisseurs, agents, clients et super admins.
 * Le rôle est déterminé côté serveur, puis redirigé vers l'espace correspondant.
 */
export function LoginPage() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  return (
    <AuthShell
      eyebrow="Connexion sécurisée"
      title="Bon retour parmi nous"
      subtitle="Connectez-vous à votre espace Klaro pour retrouver vos encaissements et votre activité."
      footer={
        <span>
          Pas encore de compte fournisseur ?{" "}
          <Link to="/auth/register" className="font-medium text-brand hover:underline">
            Créer un compte
          </Link>
        </span>
      }
    >
      {message && (
        <AuthAlert variant="success" className="mb-4">
          {message}
        </AuthAlert>
      )}

      <LoginForm />

      <div className="mt-6 space-y-2 border-t border-border pt-5 text-center text-sm text-muted">
        <p>
          Client, première connexion ?{" "}
          <Link
            to="/auth/activation/client"
            className="font-medium text-brand hover:underline"
          >
            Activer mon compte client
          </Link>
        </p>
        <p>
          Agent, première connexion ?{" "}
          <Link to="/auth/activation" className="font-medium text-brand hover:underline">
            Activer mon compte agent
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default LoginPage;
