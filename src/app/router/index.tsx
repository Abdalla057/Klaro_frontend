import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "../../features/landing/pages/LandingPage";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { ActivationPage } from "../../features/auth/pages/ActivationPage";
import { RequireAuth, RequireGuest } from "./guards";
import { AgentLayout } from "../../features/agent/layouts/AgentLayout";
import { AgentDashboardPage } from "../../features/agent/pages/AgentDashboardPage";
import { EncaissementsAgentPage } from "../../features/agent/pages/EncaissementsAgentPage";
import { DecaissementsAgentPage } from "../../features/agent/pages/DecaissementsAgentPage";
import { ClientsAgentPage } from "../../features/agent/pages/ClientsAgentPage";
import { TransactionsAgentPage } from "../../features/agent/pages/TransactionsAgentPage";
import { ProfilAgentPage } from "../../features/agent/pages/ProfilAgentPage";
import { ClientHome } from "../../features/client/pages/ClientHome";
import { FournisseurLayout } from "../../features/fournisseur/layouts/FournisseurLayout";
import { FournisseurDashboard } from "../../features/fournisseur/pages/FournisseurDashboard";
import { ClientsPage } from "../../features/fournisseur/pages/ClientsPage";
import { AgentPage } from "../../features/fournisseur/pages/AgentPage";
import { EncaissementsPage } from "../../features/fournisseur/pages/EncaissementsPage";
import { FinancesPage } from "../../features/fournisseur/pages/FinancesPage";
import { AbonnementPage } from "../../features/fournisseur/pages/AbonnementPage";
import { ProfilPage } from "../../features/fournisseur/pages/ProfilPage";
import { AdminHome } from "../../features/admin/pages/AdminHome";

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
        <ClientHome />
      </RequireAuth>
    ),
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
        <AdminHome />
      </RequireAuth>
    ),
  },
  {
    path: "*",
    element: (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Page non trouvée
      </div>
    ),
  },
]);

export default router;
