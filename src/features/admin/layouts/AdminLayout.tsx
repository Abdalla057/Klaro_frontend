import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminMobileNav, AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { AdminProvider } from "../context/AdminProvider";
import { useAuth } from "../../../context/authContextCore";
import { logout } from "../../../services/authService";
import { AnimatedOutlet } from "../../../shared/ui/animated-outlet";

export function AdminLayout() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();

  const deconnexion = () => {
    void logout();
    logoutLocal();
    navigate("/auth/login", { replace: true });
  };

  return (
    <AdminProvider>
      <div className="min-h-screen bg-mint text-ink sm:p-4 lg:p-6">
        <div className="mx-auto flex min-h-screen max-w-[1500px] overflow-clip bg-white shadow-menu sm:min-h-[calc(100dvh-2rem)] sm:rounded-panel lg:h-[calc(100dvh-3rem)] lg:min-h-0 lg:rounded-panel">
          <AdminSidebar />
          <AdminMobileNav
            open={menuOuvert}
            onClose={() => setMenuOuvert(false)}
            onLogout={deconnexion}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar onMenu={() => setMenuOuvert(true)} onLogout={deconnexion} />
            <main className="flex-1 bg-panel px-4 pb-6 pt-2 sm:px-6 lg:overflow-y-auto lg:pb-8 lg:pl-8 lg:pr-8">
              <div className="mx-auto w-full max-w-[1440px]">
                <AnimatedOutlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}
