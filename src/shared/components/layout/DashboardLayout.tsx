import { useAuth } from "../../../context/authContextCore";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button/button";
import { logout } from "../../../services/authService";

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user, logoutLocal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    void logout();
    logoutLocal();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-base font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">
              {user?.telephone} • {user?.role_display || user?.role}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export default DashboardLayout;
