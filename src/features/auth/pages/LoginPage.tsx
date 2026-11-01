import { Link, useLocation } from "react-router-dom";
import { Container } from "../../../shared/ui/container";
import { Card } from "../../../shared/ui/card";
import { Heading, Text } from "../../../shared/ui/typography";
import { LoginForm } from "../components/LoginForm";
import { AuthAlert } from "../components/AuthAlert";

export function LoginPage() {
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Heading as="h1" size="2xl">Connexion</Heading>
            <Text className="mt-2 text-gray-600">Accédez à votre espace</Text>
          </div>
          <Card className="p-6">
            {message && (
              <AuthAlert variant="success" className="mb-4">
                {message}
              </AuthAlert>
            )}
            <LoginForm />
            <Text size="sm" className="mt-4 text-center text-gray-600">
              Première connexion avec un code d'activation ?{" "}
              <Link to="/auth/activation" className="text-gray-900 underline">
                Activer mon compte
              </Link>
            </Text>
            <Text size="sm" className="mt-2 text-center text-gray-600">
              Pas de compte ?{" "}
              <Link to="/auth/register" className="text-gray-900 underline">
                S'inscrire
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

export default LoginPage;
