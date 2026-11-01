import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Wallet, X } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Container } from "../../../shared/ui/container";
import { cn } from "../../../shared/utils/cn";
import { BRAND, NAV, PRIMARY_CTA, ROUTES } from "../constants";
import { AnchorLink } from "./common";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/85 backdrop-blur transition-shadow",
        scrolled ? "border-gray-200 shadow-sm shadow-black/5" : "border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-brand">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <Wallet className="h-4 w-4" aria-hidden="true" />
          </span>
          {BRAND}
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <AnchorLink
              key={item.id}
              id={item.id}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-soft hover:text-brand"
            >
              {item.label}
            </AnchorLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" className="text-ink hover:bg-brand-soft hover:text-brand">
            <Link to={ROUTES.login}>Se connecter</Link>
          </Button>
          <Button asChild className={PRIMARY_CTA}>
            <Link to={ROUTES.register}>Créer un compte</Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-lg border border-gray-200 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white lg:hidden">
          <Container>
            <nav aria-label="Menu mobile" className="flex flex-col py-2">
              {NAV.map((item) => (
                <AnchorLink
                  key={item.id}
                  id={item.id}
                  onClick={() => setOpen(false)}
                  className="border-b border-gray-100 py-3 font-medium text-ink last:border-none"
                >
                  {item.label}
                </AnchorLink>
              ))}
            </nav>
            <div className="grid gap-2 py-4">
              <Button asChild variant="outline">
                <Link to={ROUTES.login} onClick={() => setOpen(false)}>
                  Se connecter
                </Link>
              </Button>
              <Button asChild className={PRIMARY_CTA}>
                <Link to={ROUTES.register} onClick={() => setOpen(false)}>
                  Créer un compte
                </Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
