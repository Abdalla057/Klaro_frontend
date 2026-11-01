import { DashboardLayout } from "../../../shared/components/layout/DashboardLayout";

export function ClientHome() {
  return (
    <DashboardLayout title="Espace Client">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-700">Bienvenue dans votre espace client.</p>
      </div>
    </DashboardLayout>
  );
}

export default ClientHome;
