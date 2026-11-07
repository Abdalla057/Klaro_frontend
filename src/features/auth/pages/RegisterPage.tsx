import { Link } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { RegisterForm } from "../components/RegisterForm";

/**
 * RegisterPage
 *
 * Inscription d'un fournisseur. Un essai gratuit est déclenché automatiquement
 * côté serveur à la création du compte.
 */
export function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Inscription fournisseur"
      title="Créez votre espace Klaro"
      subtitle="Quelques informations suffisent pour démarrer votre activité et profiter de l'essai gratuit."
      footer={
        <span>
          Déjà un compte ?{" "}
          <Link to="/auth/login" className="font-medium text-brand hover:underline">
            Se connecter
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

export default RegisterPage;
