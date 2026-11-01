import { Link } from "react-router-dom";
import { Container } from "../../../shared/ui/container";
import { Card } from "../../../shared/ui/card";
import { Heading, Text } from "../../../shared/ui/typography";
import { ActivationForm } from "../components/ActivationForm";

export function ActivationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Heading as="h1" size="2xl">
              Activer mon compte
            </Heading>
            <Text className="mt-2 text-gray-600">
              Agent ou client : utilisez le code fourni par votre fournisseur.
            </Text>
          </div>
          <Card className="p-6">
            <ActivationForm />
            <Text size="sm" className="mt-4 text-center text-gray-600">
              Déjà activé ?{" "}
              <Link to="/auth/login" className="text-gray-900 underline">
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

export default ActivationPage;
