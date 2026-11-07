import { Link } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { ActivationForm } from "../components/ActivationForm";

/**
 * ActivationPage
 *
 * Activation d'un compte agent à partir du code fourni par le fournisseur.
 * L'étape 1 vérifie le code, l'étape 2 définit le mot de passe.
 */
export function ActivationPage() {
  return (
    <AuthShell
      eyebrow="Activation du compte"
      title="Activer mon compte agent"
      subtitle="Utilisez le code à 6 chiffres fourni par votre fournisseur, puis choisissez votre mot de passe."
      footer={
        <span>
          Déjà activé ?{" "}
          <Link to="/auth/login" className="font-medium text-brand hover:underline">
            Se connecter
          </Link>
        </span>
      }
    >
      <ActivationForm />
    </AuthShell>
  );
}

export default ActivationPage;
