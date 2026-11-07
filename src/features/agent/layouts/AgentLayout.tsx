import { useState } from "react";
import { AgentProvider } from "../context/AgentProvider";
import { AgentSidebar } from "../components/AgentSidebar";
import { AgentTopbar } from "../components/AgentTopbar";
import { AnimatedOutlet } from "../../../shared/ui/animated-outlet";

/**
 * AgentLayout
 *
 * Coquille de l'espace agent : sidebar fixe, barre supérieure collante et
 * zone de contenu animée entre les routes.
 */
export function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AgentProvider>
      <div className="min-h-screen bg-surface text-ink">
        <AgentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-72">
          <AgentTopbar onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatedOutlet />
          </main>
        </div>
      </div>
    </AgentProvider>
  );
}
