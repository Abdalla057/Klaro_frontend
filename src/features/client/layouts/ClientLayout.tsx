import { useState } from "react";
import { ClientProvider } from "../context/ClientProvider";
import { ClientSidebar } from "../components/ClientSidebar";
import { ClientTopbar } from "../components/ClientTopbar";
import { AnimatedOutlet } from "../../../shared/ui/animated-outlet";

/**
 * ClientLayout
 *
 * Coquille de l'espace client. Structure identique aux autres dashboards pour
 * garantir une expérience cohérente : sidebar vert, topbar translucide, contenu
 * animé.
 */
export function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ClientProvider>
      <div className="min-h-screen bg-surface text-ink">
        <ClientSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <ClientTopbar onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatedOutlet />
          </main>
        </div>
      </div>
    </ClientProvider>
  );
}
