import { Building2, Check, Users, type LucideIcon } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { SectionTitle } from "./common";

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Building2, title: "Créez votre compte", text: "Le fournisseur enregistre son entreprise et accède à son espace." },
  { icon: Users, title: "Organisez votre activité", text: "Le fournisseur gère ses clients et ses agents selon les possibilités de son abonnement." },
  { icon: Check, title: "Suivez vos encaissements", text: "Les opérations sont consultées et confirmées selon le parcours prévu par l’application." },
];

export function Steps() {
  return (
    <section id="fonctionnement" className="bg-brand-soft py-16 lg:py-24">
      <Container>
        <SectionTitle
          eyebrow="Comment ça marche"
          title="Trois étapes pour démarrer"
          sub="Un parcours simple, de la création du compte au suivi des encaissements."
        />

        <div className="relative">
          <div className="absolute left-0 right-0 top-11 hidden h-px bg-brand/15 md:block" aria-hidden="true" />
          <ol className="relative grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="rounded-2xl border border-white bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-black text-brand/10" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">
                  Étape {index + 1} — {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
