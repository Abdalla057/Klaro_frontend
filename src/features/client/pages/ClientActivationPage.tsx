import { Link } from "react-router-dom";
import { AuthShell } from "../../auth/components/AuthShell";
import { ActivationForm } from "../../auth/components/ActivationForm";

/**
 * ClientActivationPage
 *
 * Écran dédié à l'activation d'un compte client. Le rôle attendu est transmis
 * au formulaire pour empêcher l'activation d'un compte agent depuis cet espace.
 */
export function ClientActivationPage() {
  return (
    <AuthShell
      eyebrow="Activation du compte"
      title="Activer mon compte client"
      subtitle="Saisissez le code à 6 chiffres remis par votre fournisseur, puis définissez votre mot de passe."
      footer={
        <span>
          Déjà activé ?{" "}
          <Link to="/auth/login" className="font-medium text-brand hover:underline">
            Se connecter
          </Link>
        </span>
      }
    >
      <ActivationForm expectedRole="client" />
    </AuthShell>
  );
}

export default ClientActivationPage;
