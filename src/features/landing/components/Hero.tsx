import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Container } from "../../../shared/ui/container";
import { Heading, Text } from "../../../shared/ui/typography";
import { PRIMARY_CTA, ROUTES } from "../constants";
import { scrollToId } from "../lib/scroll";
import { DashboardMock } from "./DashboardMock";

const HIGHLIGHTS = ["Sans installation", "Accès par rôle", "Données centralisées"];

export function Hero() {
  return (
    <section id="accueil" className="relative overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-soft blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <Container className="relative grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-white px-3 py-1.5 text-xs font-semibold text-brand shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            La gestion des encaissements simplifiée
          </span>

          <Heading as="h1" size="4xl" className="mt-6 text-ink">
            Gérez vos encaissements <span className="text-brand-accent">en toute simplicité.</span>
          </Heading>

          <Text size="lg" className="mt-6 max-w-xl text-muted">
            Centralisez vos clients, suivez les montants dus et confirmez vos encaissements depuis une seule
            plateforme. Une solution conçue pour simplifier le suivi de votre activité au quotidien.
          </Text>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className={PRIMARY_CTA}>
              <Link to={ROUTES.register}>
                Commencer maintenant <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToId("fonctionnalites")}>
              Découvrir les fonctionnalités
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted">
                <Check className="h-4 w-4 text-brand-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <DashboardMock />
        </div>
      </Container>
    </section>
  );
}
