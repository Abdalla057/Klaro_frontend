import { CreditCard, KeyRound, LayoutDashboard, Receipt, UserCheck, Users, type LucideIcon } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { IconBox, SectionTitle } from "./common";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Users, title: "Gestion des clients", text: "Centralisez les informations de vos clients et consultez les montants dus." },
  { icon: UserCheck, title: "Gestion des agents", text: "Organisez vos agents et facilitez le suivi de leurs opérations." },
  { icon: Receipt, title: "Suivi des encaissements", text: "Consultez les opérations et leurs statuts : en attente, confirmé ou annulé." },
  { icon: KeyRound, title: "Confirmation par code", text: "Validez un encaissement grâce au parcours de confirmation par code." },
  { icon: LayoutDashboard, title: "Tableau de bord", text: "Visualisez les indicateurs essentiels et les opérations récentes." },
  { icon: CreditCard, title: "Gestion des abonnements", text: "Consultez les formules, les durées et les quotas associés." },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="bg-surface py-16 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Fonctionnalités"
          title="Tout ce qu’il faut pour suivre vos encaissements"
          sub="Des outils clairs, pensés pour le quotidien des fournisseurs."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl hover:shadow-brand/5"
            >
              <span
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand-accent transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
              <IconBox icon={feature.icon} />
              <h3 className="mt-5 text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
