import { Link } from "react-router-dom";
import { ArrowUp, Wallet } from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { BRAND, ROUTES } from "../constants";
import { AnchorLink } from "./common";

const LINK_CLASS = "text-sm text-muted transition-colors hover:text-ink";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-green/10 text-gray-400 ">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="flex items-center gap-2 text-lg font-extrabold text-brand">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <Wallet className="h-4 w-4" aria-hidden="true" />
            </span>
            {BRAND}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Plateforme de gestion des encaissements, des clients, des agents et des abonnements.
          </p>
        </div>

        <nav aria-label="Produit">
          <p className="font-semibold text-ink">Produit</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <AnchorLink id="fonctionnalites" className={LINK_CLASS}>
                Fonctionnalités
              </AnchorLink>
            </li>
            <li>
              <AnchorLink id="abonnements" className={LINK_CLASS}>
                Abonnements
              </AnchorLink>
            </li>
            <li>
              <AnchorLink id="faq" className={LINK_CLASS}>
                FAQ
              </AnchorLink>
            </li>
          </ul>
        </nav>

        <nav aria-label="Compte">
          <p className="font-semibold text-ink">Compte</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to={ROUTES.login} className={LINK_CLASS}>
                Se connecter
              </Link>
            </li>
            <li>
              <Link to={ROUTES.register} className={LINK_CLASS}>
                Créer un compte
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-semibold text-ink">Informations légales</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>Mentions légales (à venir)</li>
            <li>Politique de confidentialité (à venir)</li>
            <li>Conditions d’utilisation (à venir)</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-gray-100 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted">© 2026 {BRAND}. Nom et logo provisoires.</p>
          <a
            href="#accueil"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-accent"
          >
            Retour en haut <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </a>
        </Container>
      </div>
    </footer>
  );
}
