import { Link } from "react-router-dom";
import { Container } from "../../../shared/ui/container";
import { Card } from "../../../shared/ui/card";
import { Heading, Text } from "../../../shared/ui/typography";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Heading as="h1" size="2xl">Inscription fournisseur</Heading>
            <Text className="mt-2 text-gray-600">Créez votre espace et profitez de l’essai gratuit.</Text>
          </div>
          <Card className="p-6">
            <RegisterForm />
            <Text size="sm" className="mt-4 text-center text-gray-600">
              Déjà un compte ?{" "}
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

export default RegisterPage;
