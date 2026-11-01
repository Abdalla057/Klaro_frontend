import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FournisseurProvider } from "../context/FournisseurProvider";
import { FournisseurSidebar } from "../components/FournisseurSidebar";
import { FournisseurTopbar } from "../components/FournisseurTopbar";

export function FournisseurLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <FournisseurProvider>
      <div className="min-h-screen bg-surface text-ink">
        <FournisseurSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <FournisseurTopbar onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </FournisseurProvider>
  );
}
