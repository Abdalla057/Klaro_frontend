import { CreditCard, KeyRound, LayoutDashboard, Receipt, type LucideIcon } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { IconBox } from "./common";

const PILLARS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: LayoutDashboard, title: "Gestion centralisée", text: "Clients, agents et opérations dans un seul espace." },
  { icon: Receipt, title: "Suivi des encaissements", text: "Consultez chaque opération et son statut." },
  { icon: KeyRound, title: "Confirmation par code", text: "Validez les opérations grâce à un parcours de confirmation par code." },
  { icon: CreditCard, title: "Gestion des abonnements", text: "Formules, durées et quotas associés." },
];

export function Pillars() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <h2 className="sr-only">Points clés de la plateforme</h2>
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="flex items-start gap-3">
            <IconBox icon={pillar.icon} className="h-11 w-11 rounded-lg" />
            <div>
              <h3 className="font-semibold text-ink">{pillar.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{pillar.text}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
