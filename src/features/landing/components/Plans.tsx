import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Container } from "../../../shared/ui/container";
import { cn } from "../../../shared/utils/cn";
import { PRIMARY_CTA, ROUTES } from "../constants";
import { SectionTitle } from "./common";

const PLANS = [
  {
    name: "Simple",
    description: "Pour les petites structures",
    price: "5 000 FCFA",
    duration: "30 jours",
    clients: "100 clients maximum",
    agents: "2 agents maximum",
    featured: false,
  },
  {
    name: "Premium",
    description: "Pour les structures en croissance",
    price: "10 000 FCFA",
    duration: "30 jours",
    clients: "500 clients maximum",
    agents: "5 agents maximum",
    featured: true,
  },
  {
    name: "Pro",
    description: "Pour les activités à fort volume",
    price: "15 000 FCFA",
    duration: "30 jours",
    clients: "Clients illimités",
    agents: "Agents illimités",
    featured: false,
  },
];

export function Plans() {
  return (
    <section id="abonnements" className="bg-surface py-16 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Abonnements"
          title="Des formules adaptées à votre activité"
          sub="Chaque nouvelle entreprise bénéficie de 30 jours d'essai gratuit. Choisissez ensuite la formule qui correspond à votre volume d'activité."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-panel border bg-white p-6 shadow-card",
                plan.featured ? "border-brand shadow-menu" : "border-border",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1.5 text-eyebrow uppercase text-white">
                  Recommandée
                </span>
              )}

              <h3 className="text-base font-semibold tracking-[-0.012em] text-ink">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[1.75rem] font-semibold tracking-[-0.025em] tabular-nums text-ink">
                  {plan.price}
                </span>
                <span className="text-sm text-muted">/ {plan.duration}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  plan.clients,
                  plan.agents,
                  "Suivi des encaissements",
                  "Gestion des clients et des agents",
                  "Confirmation par code",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button asChild variant={plan.featured ? "default" : "outline"} className={cn("mt-7 w-full", plan.featured && PRIMARY_CTA)}>
                <Link to={ROUTES.register}>Choisir cette formule</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted">
                Essai gratuit de 30 jours inclus, sans engagement.
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
