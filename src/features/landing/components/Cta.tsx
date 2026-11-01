import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Container } from "../../../shared/ui/container";
import { Heading, Text } from "../../../shared/ui/typography";
import { ROUTES } from "../constants";

export function Cta() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <Heading as="h2" size="2xl" className="text-white">
              Simplifiez le suivi de vos encaissements dès aujourd’hui.
            </Heading>
            <Text size="lg" className="mx-auto mt-4 max-w-xl text-white/75">
              Retrouvez les informations essentielles de votre activité dans une interface claire et centralisée.
            </Text>
            <Button asChild size="lg" className="mt-8 bg-white text-brand hover:bg-white/90">
              <Link to={ROUTES.register}>
                Créer mon compte <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
