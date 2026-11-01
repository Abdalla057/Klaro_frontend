import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Container } from "../../../shared/ui/container";
import { cn } from "../../../shared/utils/cn";
import { PRIMARY_CTA, ROUTES } from "../constants";
import { SectionTitle } from "./common";

const PLANS = [
  {
    name: "Formule 1",
    price: "[PRIX]",
    duration: "[DURÉE]",
    clients: "[QUOTA CLIENTS]",
    agents: "[QUOTA AGENTS]",
    featured: false,
  },
  {
    name: "Formule 2",
    price: "[PRIX]",
    duration: "[DURÉE]",
    clients: "[QUOTA CLIENTS]",
    agents: "[QUOTA AGENTS]",
    featured: true,
  },
  {
    name: "Formule 3",
    price: "[PRIX]",
    duration: "[DURÉE]",
    clients: "[QUOTA CLIENTS]",
    agents: "[QUOTA AGENTS]",
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
          sub="Les tarifs et quotas ci-dessous sont des emplacements à renseigner avec la configuration réelle."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-white p-6",
                plan.featured ? "border-brand shadow-xl shadow-brand/10 md:-translate-y-2" : "border-gray-100",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                  Recommandée
                </span>
              )}

              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink">{plan.price}</span>
                <span className="text-sm text-muted">/ {plan.duration}</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  `${plan.clients} clients maximum`,
                  `${plan.agents} agents maximum`,
                  "Suivi des encaissements",
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
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
