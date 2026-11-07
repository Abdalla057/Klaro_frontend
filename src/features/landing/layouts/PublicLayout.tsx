import type { ReactNode } from "react";
import { Footer, Navbar } from "../components";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu">{children}</main>
      <Footer />
    </div>
  );
}

export { PublicLayout };
