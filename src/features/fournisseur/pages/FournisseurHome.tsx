import { DashboardLayout } from "../../../shared/components/layout/DashboardLayout";

export function FournisseurHome() {
  return (
    <DashboardLayout title="Espace Fournisseur">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-700">Bienvenue dans votre espace fournisseur.</p>
      </div>
    </DashboardLayout>
  );
}

export default FournisseurHome;
