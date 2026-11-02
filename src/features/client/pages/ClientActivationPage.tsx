import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { Card } from "../../../shared/ui/card";
import { Heading, Text } from "../../../shared/ui/typography";
import { ActivationForm } from "../../auth/components/ActivationForm";

export function ClientActivationPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Container className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <Heading as="h1" size="2xl" className="mt-4">
              Activer mon compte client
            </Heading>
            <Text className="mt-2 text-gray-600">
              Utilisez le code à 6 chiffres fourni par votre fournisseur, puis choisissez votre mot
              de passe.
            </Text>
          </div>

          <Card className="rounded-2xl p-6">
            <ActivationForm expectedRole="client" />
            <Text size="sm" className="mt-5 text-center text-gray-600">
              Déjà activé ?{" "}
              <Link to="/auth/login" className="font-medium text-gray-900 underline">
                Se connecter
              </Link>
            </Text>
          </Card>

          <Text size="sm" className="mt-4 text-center">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Retour à l'accueil
            </Link>
          </Text>
        </div>
      </Container>
    </div>
  );
}

export default ClientActivationPage;
