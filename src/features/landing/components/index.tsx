import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Building2, Check, ChevronDown, CreditCard, KeyRound, LayoutDashboard,
  Menu, Receipt, UserCheck, Users, Wallet, X, type LucideIcon,
} from "lucide-react";
import { Container } from "../../../shared/ui/container";
import { Button } from "../../../shared/ui/button/button";
import { Heading, Text } from "../../../shared/ui/typography";

/* ---------- Constantes ---------- */
const BRAND = "EncaissePro"; // nom provisoire
const ROUTES = { login: "/auth/login", register: "/auth/register" } as const;
const primary = "bg-[#0C3B2E] text-white hover:bg-[#0C3B2E]/90";

const NAV = [
  { label: "Accueil", id: "accueil" },
  { label: "Fonctionnalités", id: "fonctionnalites" },
  { label: "Comment ça marche", id: "fonctionnement" },
  { label: "Abonnements", id: "abonnements" },
  { label: "FAQ", id: "faq" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AnchorLink({ id, className, children, onClick }: { id: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <a href={`#${id}`} className={className} onClick={(e) => { e.preventDefault(); onClick?.(); scrollToId(id); }}>
      {children}
    </a>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <Heading as="h2" size="2xl" className="text-[#17211D] sm:text-4xl">{title}</Heading>
      {sub && <Text size="lg" className="mt-3 text-[#6B7280]">{sub}</Text>}
    </div>
  );
}

function IconBox({ icon: Icon, dark = false }: { icon: LucideIcon; dark?: boolean }) {
  return (
    <span className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? "bg-[#0C3B2E] text-white" : "bg-[#E8F2EC] text-[#0C3B2E]"}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

/* ---------- Navbar ---------- */
export function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-[#0C3B2E]">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0C3B2E] text-white"><Wallet className="h-4 w-4" aria-hidden="true" /></span>
          {BRAND}
        </Link>
        <nav aria-label="Navigation principale" className="hidden gap-7 text-sm font-medium lg:flex">
          {NAV.map((n) => <AnchorLink key={n.id} id={n.id} className="text-[#6B7280] transition-colors hover:text-[#17211D]">{n.label}</AnchorLink>)}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" onClick={() => navigate(ROUTES.login)}>Se connecter</Button>
          <Button className={primary} onClick={() => navigate(ROUTES.register)}>Créer un compte</Button>
        </div>
        <button
          type="button" className="grid h-11 w-11 place-items-center rounded-lg border border-gray-200 lg:hidden"
          aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>
      {open && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white pb-4 lg:hidden">
          <Container>
            <nav aria-label="Menu mobile" className="flex flex-col">
              {NAV.map((n) => <AnchorLink key={n.id} id={n.id} onClick={() => setOpen(false)} className="border-b border-gray-100 py-3 font-medium">{n.label}</AnchorLink>)}
            </nav>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" onClick={() => navigate(ROUTES.login)}>Se connecter</Button>
              <Button className={primary} onClick={() => navigate(ROUTES.register)}>Créer un compte</Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero + maquette ---------- */
type Status = "confirme" | "attente" | "annule";
const STATUS: Record<Status, { label: string; cls: string }> = {
  confirme: { label: "Confirmé", cls: "bg-emerald-100 text-emerald-800" },
  attente: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  annule: { label: "Annulé", cls: "bg-red-100 text-red-800" },
};
// Données fictives de démonstration
const DEMO_TX: { name: string; amount: string; date: string; status: Status }[] = [
  { name: "Awa Diop", amount: "45 000", date: "28 oct.", status: "confirme" },
  { name: "Moussa Ndiaye", amount: "120 000", date: "28 oct.", status: "attente" },
  { name: "Fatou Sow", amount: "30 000", date: "27 oct.", status: "annule" },
  { name: "Ibrahima Fall", amount: "75 000", date: "26 oct.", status: "confirme" },
];
const DEMO_CHART = [20, 34, 28, 48, 42, 62, 74];

function DashboardMock() {
  const w = 300, h = 90;
  const pts = DEMO_CHART.map((v, i) => `${(i / (DEMO_CHART.length - 1)) * w},${h - v}`).join(" ");
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-black/5 sm:p-5" role="img" aria-label="Aperçu illustratif d’un tableau de bord avec des données fictives">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <p className="font-semibold text-[#17211D]">Tableau de bord</p>
        <span className="text-xs text-[#6B7280]">Aperçu illustratif, données fictives</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[["À encaisser", "1 250 000 F"], ["Clients", "48"], ["Confirmés", "126"]].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-[#E8F2EC] p-3">
            <p className="text-[11px] text-[#6B7280]">{l}</p>
            <p className="mt-1 text-sm font-bold text-[#0C3B2E] sm:text-base">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-gray-100 p-3">
        <p className="mb-2 text-xs text-[#6B7280]">Évolution des encaissements sur 7 jours</p>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-24 w-full">
          <polyline points={`0,${h} ${pts} ${w},${h}`} fill="#E8F2EC" />
          <polyline points={pts} fill="none" stroke="#2F7D5B" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      </div>
      <ul className="mt-4 divide-y divide-gray-100">
        {DEMO_TX.map((t) => (
          <li key={t.name} className="flex items-center justify-between gap-2 py-2.5 text-sm">
            <div className="min-w-0"><p className="truncate font-medium text-[#17211D]">{t.name}</p><p className="text-xs text-[#6B7280]">{t.date}</p></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-semibold text-[#17211D]">{t.amount} F</span>
              <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  return (
    <section id="accueil" className="bg-[#F8FAF9] py-14 lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-semibold text-[#0C3B2E]">La gestion des encaissements simplifiée</span>
          <Heading as="h1" size="4xl" className="mt-5 text-[#17211D]">Gérez vos encaissements en toute simplicité.</Heading>
          <Text size="lg" className="mt-5 max-w-xl text-[#6B7280]">
            Centralisez vos clients, suivez les montants dus et confirmez vos encaissements depuis une seule plateforme. Une solution conçue pour simplifier le suivi de votre activité au quotidien.
          </Text>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className={primary} onClick={() => navigate(ROUTES.register)}>Commencer maintenant</Button>
            <Button size="lg" variant="outline" onClick={() => scrollToId("fonctionnalites")}>Découvrir les fonctionnalités</Button>
          </div>
          <Text size="sm" className="mt-6 flex items-center gap-2 text-[#6B7280]">
            <Check className="h-4 w-4 shrink-0 text-[#2F7D5B]" aria-hidden="true" />
            Clients, agents, encaissements et abonnements réunis au même endroit.
          </Text>
        </div>
        <DashboardMock />
      </Container>
    </section>
  );
}

/* ---------- Présentation ---------- */
const PILLARS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: LayoutDashboard, title: "Gestion centralisée", text: "Clients, agents et opérations dans un seul espace." },
  { icon: Receipt, title: "Suivi des encaissements", text: "Consultez chaque opération et son statut." },
  { icon: KeyRound, title: "Confirmation par code", text: "Validez les opérations grâce à un parcours de confirmation par code." },
  { icon: CreditCard, title: "Gestion des abonnements", text: "Formules, durées et quotas associés." },
];
export function Pillars() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <Container className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p) => (
          <div key={p.title} className="flex gap-3">
            <IconBox icon={p.icon} />
            <div><h3 className="font-semibold text-[#17211D]">{p.title}</h3><Text size="sm" className="mt-1 text-[#6B7280]">{p.text}</Text></div>
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ---------- Fonctionnalités ---------- */
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
    <section id="fonctionnalites" className="bg-[#F8FAF9] py-16 lg:py-24">
      <Container>
        <SectionTitle title="Tout ce qu’il faut pour suivre vos encaissements" sub="Des outils clairs, pensés pour le quotidien des fournisseurs." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-6 transition hover:-translate-y-1 hover:border-[#2F7D5B] hover:shadow-lg hover:shadow-black/5">
              <IconBox icon={f.icon} />
              <h3 className="mt-4 text-lg font-semibold text-[#17211D]">{f.title}</h3>
              <Text size="sm" className="mt-2 text-[#6B7280]">{f.text}</Text>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Comment ça marche ---------- */
const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Building2, title: "Créez votre compte", text: "Le fournisseur enregistre son entreprise et accède à son espace." },
  { icon: Users, title: "Organisez votre activité", text: "Le fournisseur gère ses clients et ses agents selon les possibilités de son abonnement." },
  { icon: Check, title: "Suivez vos encaissements", text: "Les opérations sont consultées et confirmées selon le parcours prévu par l’application." },
];
export function Steps() {
  return (
    <section id="fonctionnement" className="bg-[#E8F2EC] py-16 lg:py-24">
      <Container>
        <SectionTitle title="Trois étapes pour démarrer" />
        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-gray-100 bg-white p-6">
              <span className="absolute -top-4 left-6 grid h-8 w-8 place-items-center rounded-full bg-[#0C3B2E] text-sm font-bold text-white">{i + 1}</span>
              <s.icon className="h-6 w-6 text-[#2F7D5B]" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-[#17211D]">Étape {i + 1} — {s.title}</h3>
              <Text size="sm" className="mt-2 text-[#6B7280]">{s.text}</Text>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ---------- À qui s'adresse l'application (remplace l'ancien ForWho) ---------- */
const AUDIENCES: { icon: LucideIcon; title: string; text: string; cta: string; to: string }[] = [
  { icon: Building2, title: "Fournisseurs", text: "Gérez vos clients, vos agents, vos encaissements et vos abonnements.", cta: "Créer un compte fournisseur", to: ROUTES.register },
  { icon: Users, title: "Clients", text: "Consultez vos encaissements et leur statut.", cta: "Accéder à mon espace", to: ROUTES.login },
  { icon: UserCheck, title: "Agents d’encaissement", text: "Accédez au parcours de confirmation des encaissements.", cta: "Accéder à mon espace", to: ROUTES.login },
];
export function ForWho() {
  const navigate = useNavigate();
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <SectionTitle title="À qui s’adresse l’application ?" />
        <div className="grid gap-5 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <article key={a.title} className="flex flex-col rounded-2xl border border-gray-100 bg-[#F8FAF9] p-6">
              <IconBox icon={a.icon} dark />
              <h3 className="mt-4 text-lg font-semibold text-[#17211D]">{a.title}</h3>
              <Text size="sm" className="mt-2 flex-1 text-[#6B7280]">{a.text}</Text>
              <button type="button" onClick={() => navigate(a.to)} className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#0C3B2E] hover:underline">
                {a.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Abonnements ---------- */
// PLACEHOLDERS : remplacer par les formules réelles (prix, durée, quotas) de la configuration / de l'API.
const PLANS = [
  { name: "Formule 1", price: "[PRIX]", duration: "[DURÉE]", clients: "[QUOTA CLIENTS]", agents: "[QUOTA AGENTS]" },
  { name: "Formule 2", price: "[PRIX]", duration: "[DURÉE]", clients: "[QUOTA CLIENTS]", agents: "[QUOTA AGENTS]" },
  { name: "Formule 3", price: "[PRIX]", duration: "[DURÉE]", clients: "[QUOTA CLIENTS]", agents: "[QUOTA AGENTS]" },
];
export function Plans() {
  const navigate = useNavigate();
  return (
    <section id="abonnements" className="bg-[#F8FAF9] py-16 lg:py-24">
      <Container>
        <SectionTitle title="Des formules adaptées à votre activité" sub="Les tarifs et quotas ci-dessous sont des emplacements à renseigner avec la configuration réelle." />
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <article key={p.name} className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#17211D]">{p.name}</h3>
              <dl className="mt-5 space-y-2 text-sm">
                {([["Prix", p.price], ["Durée", p.duration], ["Clients maximum", p.clients], ["Agents maximum", p.agents]] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-100 pb-2"><dt className="text-[#6B7280]">{k}</dt><dd className="font-medium text-[#17211D]">{v}</dd></div>
                ))}
              </dl>
              <Button variant="outline" className="mt-6 w-full" onClick={() => navigate(ROUTES.register)}>Choisir cette formule</Button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- FAQ ---------- */
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
        <SectionTitle title="Questions fréquentes" />
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={item.q} className="rounded-xl border border-gray-100 bg-[#F8FAF9]">
              <h3>
                <button
                  type="button" id={`faq-q-${i}`} aria-expanded={open === i} aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex min-h-13 w-full items-center justify-between gap-4 px-5 py-3 text-left font-semibold text-[#17211D]"
                >
                  {item.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
              </h3>
              {open === i && <p id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="px-5 pb-5 text-sm text-[#6B7280]">{item.a}</p>}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- Appel à l'action ---------- */
export function Cta() {
  const navigate = useNavigate();
  return (
    <section className="bg-white pb-16">
      <Container>
        <div className="rounded-3xl bg-[#0C3B2E] px-6 py-14 text-center text-white">
          <Heading as="h2" size="2xl" className="mx-auto max-w-2xl text-white sm:text-4xl">Simplifiez le suivi de vos encaissements dès aujourd’hui.</Heading>
          <Text size="lg" className="mx-auto mt-4 max-w-xl text-white/80">Retrouvez les informations essentielles de votre activité dans une interface claire et centralisée.</Text>
          <Button size="lg" className="mt-8 bg-white text-[#0C3B2E] hover:bg-white/90" onClick={() => navigate(ROUTES.register)}>Créer mon compte</Button>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  const navigate = useNavigate();
  const link = "text-sm text-[#6B7280] hover:text-[#17211D]";
  return (
    <footer className="border-t border-gray-100 bg-white">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-extrabold text-[#0C3B2E]"><Wallet className="h-5 w-5" aria-hidden="true" />{BRAND}</p>
          <Text size="sm" className="mt-3 text-[#6B7280]">Plateforme de gestion des encaissements, des clients, des agents et des abonnements.</Text>
        </div>
        <nav aria-label="Produit">
          <p className="font-semibold text-[#17211D]">Produit</p>
          <ul className="mt-3 space-y-2">
            <li><AnchorLink id="fonctionnalites" className={link}>Fonctionnalités</AnchorLink></li>
            <li><AnchorLink id="abonnements" className={link}>Abonnements</AnchorLink></li>
            <li><AnchorLink id="faq" className={link}>FAQ</AnchorLink></li>
          </ul>
        </nav>
        <div>
          <p className="font-semibold text-[#17211D]">Compte</p>
          <ul className="mt-3 space-y-2">
            <li><button type="button" className={link} onClick={() => navigate(ROUTES.login)}>Se connecter</button></li>
            <li><button type="button" className={link} onClick={() => navigate(ROUTES.register)}>Créer un compte</button></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#17211D]">Informations légales</p>
          {/* Emplacements : brancher sur de vraies pages quand le contenu existe */}
          <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
            <li>Mentions légales (à venir)</li>
            <li>Politique de confidentialité (à venir)</li>
            <li>Conditions d’utilisation (à venir)</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-gray-100 py-5 text-center">
        <Text size="sm" className="text-[#6B7280]">© 2026 {BRAND}. Nom et logo provisoires.</Text>
      </div>
    </footer>
  );
}

/* ---------- Page complète ---------- */
export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Pillars />
        <Features />
        <Steps />
        <ForWho />
        <Plans />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}