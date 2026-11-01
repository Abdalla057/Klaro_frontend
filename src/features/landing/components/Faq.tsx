import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { cn } from "../../../shared/utils/cn";
import { SectionTitle } from "./common";

const FAQ = [
  { q: "Comment créer un compte fournisseur ?", a: "Cliquez sur « Créer un compte », renseignez les informations de votre entreprise, puis accédez à votre espace fournisseur." },
  { q: "Comment ajouter un client ?", a: "Depuis votre espace fournisseur, ajoutez un client en renseignant ses informations. Le nombre de clients dépend de votre abonnement." },
  { q: "Comment fonctionne la confirmation d’un encaissement ?", a: "Un encaissement est créé en attente, puis confirmé par l’agent grâce à un code, ou directement depuis sa liste." },
  { q: "Comment consulter le statut d’une opération ?", a: "Chaque encaissement affiche un statut : en attente, confirmé ou annulé, consultable depuis votre espace." },
  { q: "Comment fonctionnent les abonnements ?", a: "Chaque formule définit une durée ainsi qu’un nombre maximal de clients et d’agents." },
  { q: "Comment accéder à mon espace ?", a: "Cliquez sur « Se connecter » et identifiez-vous. Fournisseurs, clients et agents accèdent chacun à leur espace." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-16 lg:py-24">
      <Container className="max-w-3xl">
        <SectionTitle eyebrow="FAQ" title="Questions fréquentes" sub="Tout ce qu’il faut savoir avant de commencer." />

        <div className="space-y-3">
          {FAQ.map((item, index) => {
            const isOpen = open === index;

            return (
              <div
                key={item.q}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white transition-colors",
                  isOpen ? "border-brand/20 shadow-sm" : "border-gray-100",
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink"
                  >
                    {item.q}
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
                        isOpen ? "bg-brand text-white" : "bg-surface text-muted",
                      )}
                    >
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${index}`}
                  role="region"
                  aria-labelledby={`faq-q-${index}`}
                  aria-hidden={!isOpen}
                  className={cn(
                    "grid transition-all duration-300",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
