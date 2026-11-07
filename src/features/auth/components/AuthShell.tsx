import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { KlaroLogo, KlaroMark } from "../../../shared/ui/klaro-logo";
import { Reveal } from "../../../shared/ui/motion";

const ARGUMENTS = [
  {
    icon: Wallet,
    title: "Encaissements suivis en temps réel",
    description: "Chaque opération est tracée et rattachée à un client et un agent.",
  },
  {
    icon: Users,
    title: "Un espace pour chaque rôle",
    description: "Fournisseur, agent, client et super admin disposent de leur dashboard dédié.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité et contrôle",
    description: "Activation par code, rôles stricts et historique financier inviolable.",
  },
];

/**
 * AuthShell
 *
 * Mise en page commune des écrans d'authentification : panneau de marque à
 * gauche (masqué sur mobile) et formulaire recentré à droite. Les pages ne
 * gèrent ainsi que leur titre, leur formulaire et leurs liens secondaires.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-brand px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative">
          <KlaroLogo variant="glass" subtitle="Gestion d'encaissements" subtitleClassName="text-white/50" />
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5 text-sun" aria-hidden="true" />
            La finance de terrain, simplifiée
          </span>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Encaissez plus vite.
            <br />
            Pilotez avec clarté.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
            Klaro centralise vos encaissements, décaissements et soldes clients dans une interface
            unique, lisible et sécurisée.
          </p>

          <ul className="mt-8 space-y-4">
            {ARGUMENTS.map((argument) => (
              <li key={argument.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                  <argument.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{argument.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                    {argument.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-white/40">
          <KlaroMark className="h-7 w-7" variant="glass" />
          <span>© {new Date().getFullYear()} Klaro. Tous droits réservés.</span>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="lg:hidden" aria-label="Retour à l'accueil Klaro">
            <KlaroLogo subtitle="Gestion d'encaissements" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <Reveal className="w-full max-w-md">
            <div className="mb-6">
              {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
                  {eyebrow}
                </p>
              )}
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>}
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
              {children}
            </div>

            {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
          </Reveal>
        </div>
      </main>
    </div>
  );
}
