export { BRAND } from "../../shared/constants";

export const ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
} as const;

export const PRIMARY_CTA =
  "bg-brand text-white shadow-sm shadow-brand/20 hover:bg-brand-dark focus-visible:ring-brand";

export const NAV = [
  { label: "Accueil", id: "accueil" },
  { label: "Fonctionnalités", id: "fonctionnalites" },
  { label: "Comment ça marche", id: "fonctionnement" },
  { label: "Abonnements", id: "abonnements" },
  { label: "FAQ", id: "faq" },
] as const;
