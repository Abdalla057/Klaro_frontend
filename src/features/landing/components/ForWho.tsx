import { Link } from "react-router-dom";
import { ArrowRight, Building2, UserCheck, Users, type LucideIcon } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { ROUTES } from "../constants";
import { IconBox, SectionTitle } from "./common";

const AUDIENCES: { icon: LucideIcon; title: string; text: string; cta: string; to: string }[] = [
  {
    icon: Building2,
    title: "Fournisseurs",
    text: "Gérez vos clients, vos agents, vos encaissements et vos abonnements.",
    cta: "Créer un compte fournisseur",
    to: ROUTES.register,
  },
  {
    icon: Users,
    title: "Clients",
    text: "Consultez vos encaissements et leur statut.",
    cta: "Accéder à mon espace",
    to: ROUTES.login,
  },
  {
    icon: UserCheck,
    title: "Agents d’encaissement",
    text: "Accédez au parcours de confirmation des encaissements.",
    cta: "Accéder à mon espace",
    to: ROUTES.login,
  },
];

export function ForWho() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Pour qui ?"
          title="À qui s’adresse l’application ?"
          sub="Chaque acteur dispose de l’espace et des actions qui lui correspondent."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <article
              key={audience.title}
              className="flex flex-col rounded-2xl border border-gray-100 bg-surface p-6 transition hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5"
            >
              <IconBox icon={audience.icon} tone="dark" />
              <h3 className="mt-5 text-lg font-semibold text-ink">{audience.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{audience.text}</p>
              <Link
                to={audience.to}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-accent"
              >
                {audience.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
