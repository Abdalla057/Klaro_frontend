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
      <div className="min-h-screen bg-mint font-admin text-ink sm:p-4 lg:p-6">
        <div className="mx-auto flex min-h-screen max-w-[1500px] overflow-clip bg-white shadow-[0_30px_80px_-40px_rgba(40,120,100,0.45)] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] lg:h-[calc(100dvh-3rem)] lg:min-h-0 lg:rounded-[2.25rem]">
          <AdminSidebar />
          <AdminMobileNav
            open={menuOuvert}
            onClose={() => setMenuOuvert(false)}
            onLogout={deconnexion}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar onMenu={() => setMenuOuvert(true)} onLogout={deconnexion} />
            <main className="flex-1 px-4 pb-6 pt-2 sm:px-6 lg:overflow-y-auto lg:pb-8 lg:pl-8 lg:pr-8">
              <AnimatedOutlet />
            </main>
          </div>
        </div>
      </div>
    </AdminProvider>
  );
}
