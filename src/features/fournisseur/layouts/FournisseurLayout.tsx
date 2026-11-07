import { useState } from "react";
import { FournisseurProvider } from "../context/FournisseurProvider";
import { FournisseurSidebar } from "../components/FournisseurSidebar";
import { FournisseurTopbar } from "../components/FournisseurTopbar";
import { AnimatedOutlet } from "../../../shared/ui/animated-outlet";

/**
 * FournisseurLayout
 *
 * Coquille de l'espace fournisseur, désormais alignée sur les espaces agent et
 * client (largeur de sidebar, marges et transition de page identiques).
 */
export function FournisseurLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <FournisseurProvider>
      <div className="min-h-screen bg-surface text-ink">
        <FournisseurSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <FournisseurTopbar onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatedOutlet />
          </main>
        </div>
      </div>
    </FournisseurProvider>
  );
}
