import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Plus, Wallet } from "lucide-react";
import type { SoldeClient } from "../../../types/fournisseur";
import { formatMoney } from "../../../shared/utils/format";
import { Button } from "../../../shared/ui/button/button";
import { CardSkeleton } from "../../../shared/ui/loading";

export function ClientBalanceCard({
  solde,
  loading = false,
}: {
  solde: SoldeClient | null;
  loading?: boolean;
}) {
  if (loading || !solde) {
    return <CardSkeleton className="h-56 rounded-2xl" />;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand p-5 text-white shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-brand-accent/30 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Solde disponible
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {formatMoney(solde.solde_disponible)}
            </p>
            <p className="mt-1 text-xs text-white/55">
              Montant que vous pouvez encore demander
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/15">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/45">
              <Wallet className="h-3 w-3" aria-hidden="true" />
              Solde dû
            </dt>
            <dd className="mt-1 text-sm font-semibold">{formatMoney(solde.solde_du)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/45">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              En cours
            </dt>
            <dd className="mt-1 text-sm font-semibold">{formatMoney(solde.montant_en_cours)}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="bg-white text-brand shadow-sm hover:bg-white/90">
            <Link to="/client/demandes/nouvelle">
              <Plus className="h-4 w-4" />
              Demander un décaissement
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/client/solde">
              Voir le détail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
