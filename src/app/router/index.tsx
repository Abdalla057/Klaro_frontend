import { Link, createBrowserRouter } from "react-router-dom";
import { Button } from "../../shared/ui/button/button";
import { KlaroMark } from "../../shared/ui/klaro-logo";
import { LandingPage } from "../../features/landing/pages/LandingPage";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { ActivationPage } from "../../features/auth/pages/ActivationPage";
import { ClientActivationPage } from "../../features/client/pages/ClientActivationPage";
import { RequireAuth, RequireGuest } from "./guards";
import { AgentLayout } from "../../features/agent/layouts/AgentLayout";
import { AgentDashboardPage } from "../../features/agent/pages/AgentDashboardPage";
import { EncaissementsAgentPage } from "../../features/agent/pages/EncaissementsAgentPage";
import { DecaissementsAgentPage } from "../../features/agent/pages/DecaissementsAgentPage";
import { ClientsAgentPage } from "../../features/agent/pages/ClientsAgentPage";
import { TransactionsAgentPage } from "../../features/agent/pages/TransactionsAgentPage";
import { ProfilAgentPage } from "../../features/agent/pages/ProfilAgentPage";
import { ClientLayout } from "../../features/client/layouts/ClientLayout";
import { ClientDashboardPage } from "../../features/client/pages/ClientDashboardPage";
import { SoldePage } from "../../features/client/pages/SoldePage";
import { DemandeDecaissementPage } from "../../features/client/pages/DemandeDecaissementPage";
import { MesDemandesPage } from "../../features/client/pages/MesDemandesPage";
import { TransactionsClientPage } from "../../features/client/pages/TransactionsClientPage";
import { ProfilClientPage } from "../../features/client/pages/ProfilClientPage";
import { FournisseurLayout } from "../../features/fournisseur/layouts/FournisseurLayout";
import { FournisseurDashboard } from "../../features/fournisseur/pages/FournisseurDashboard";
import { ClientsPage } from "../../features/fournisseur/pages/ClientsPage";
import { AgentPage } from "../../features/fournisseur/pages/AgentPage";
import { EncaissementsPage } from "../../features/fournisseur/pages/EncaissementsPage";
import { FinancesPage } from "../../features/fournisseur/pages/FinancesPage";
import { AbonnementPage } from "../../features/fournisseur/pages/AbonnementPage";
import { ProfilPage } from "../../features/fournisseur/pages/ProfilPage";
import { AdminLayout } from "../../features/admin/layouts/AdminLayout";
import { AdminHome } from "../../features/admin/pages/AdminHome";
import { AdminFournisseursPage } from "../../features/admin/pages/AdminFournisseursPage";
import { AdminAbonnementsPage } from "../../features/admin/pages/AdminAbonnementsPage";
import { AdminPlansPage } from "../../features/admin/pages/AdminPlansPage";
import { AdminPaiementsPage } from "../../features/admin/pages/AdminPaiementsPage";

/**
 * Table de routage de l'application.
 *
 * Chaque espace (agent, client, fournisseur, super admin) est protégé par
 * `RequireAuth` avec la liste des rôles autorisés. Les pages d'authentification
 * sont réservées aux visiteurs via `RequireGuest`.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth/login",
    element: (
      <RequireGuest>
        <LoginPage />
      </RequireGuest>
    ),
  },
  {
    path: "/auth/register",
    element: (
      <RequireGuest>
        <RegisterPage />
      </RequireGuest>
    ),
  },
  {
    path: "/auth/activation",
    element: (
      <RequireGuest>
        <ActivationPage />
      </RequireGuest>
    ),
  },
  {
    path: "/auth/activation/client",
    element: (
      <RequireGuest>
        <ClientActivationPage />
      </RequireGuest>
    ),
  },
  {
    path: "/agent",
    element: (
      <RequireAuth allowedRoles={["agent"]}>
        <AgentLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AgentDashboardPage /> },
      { path: "encaissements", element: <EncaissementsAgentPage /> },
      { path: "decaissements", element: <DecaissementsAgentPage /> },
      { path: "clients", element: <ClientsAgentPage /> },
      { path: "transactions", element: <TransactionsAgentPage /> },
      { path: "profil", element: <ProfilAgentPage /> },
    ],
  },
  {
    path: "/client",
    element: (
      <RequireAuth allowedRoles={["client"]}>
        <ClientLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ClientDashboardPage /> },
      { path: "solde", element: <SoldePage /> },
      { path: "demandes/nouvelle", element: <DemandeDecaissementPage /> },
      { path: "demandes", element: <MesDemandesPage /> },
      { path: "transactions", element: <TransactionsClientPage /> },
      { path: "profil", element: <ProfilClientPage /> },
    ],
  },
  {
    path: "/fournisseur",
    element: (
      <RequireAuth allowedRoles={["fournisseur"]}>
        <FournisseurLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <FournisseurDashboard /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "agent", element: <AgentPage /> },
      { path: "agents", element: <AgentPage /> },
      { path: "encaissements", element: <EncaissementsPage /> },
      { path: "finances", element: <FinancesPage /> },
      { path: "abonnement", element: <AbonnementPage /> },
      { path: "profil", element: <ProfilPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <RequireAuth allowedRoles={["super_admin"]}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminHome /> },
      { path: "fournisseurs", element: <AdminFournisseursPage /> },
      { path: "abonnements", element: <AdminAbonnementsPage /> },
      { path: "plans", element: <AdminPlansPage /> },
      { path: "paiements", element: <AdminPaiementsPage /> },
    ],
  },
  {
    path: "*",
    element: (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <KlaroMark className="h-12 w-12" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-accent">
            Erreur 404
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Cette page n'existe pas
          </h1>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Le lien est peut-être obsolète ou l'adresse a été mal saisie.
          </p>
        </div>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    ),
  },
]);

export default router;
