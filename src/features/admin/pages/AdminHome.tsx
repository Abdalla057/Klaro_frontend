import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3 } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { getApiError } from "../../../services/apiError";
import {
  getSerieChiffreAffaires,
  getStatistiquesAbonnements,
} from "../../../services/superAdminService";
import type { SerieChiffreAffaires, StatistiquesAbonnements } from "../../../types/superAdmin";
import { useAdminData } from "../context/adminContextCore";
import {
  GRANULARITE_API,
  PERIODE_API,
  calculerAlertes,
  indicateursPeriode,
  pointsChiffreAffaires,
  type PeriodeUI,
} from "../lib/dashboard";
import { HeroFinancier } from "../components/dashboard/HeroFinancier";
import { ChiffreAffairesPanel } from "../components/dashboard/ProfitChart";
import { AbonnementsCard, RevenusCard } from "../components/dashboard/MiniCards";
import { StatutsAbonnementsCard } from "../components/dashboard/StatutsAbonnementsCard";
import {
  AlertesCard,
  DernieresTransactionsCard,
  FournisseursRecentsCard,
} from "../components/dashboard/ActiviteCards";

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.55fr)_minmax(0,1fr)]">
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-64 rounded-card md:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card md:col-span-2" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    </div>
  );
}

export function AdminHome() {
  const { tableau, finances, fournisseurs, abonnements, paiements, demandes, loading, error, lastUpdated, version, refresh } =
    useAdminData();

  const [periodeCA, setPeriodeCA] = useState<PeriodeUI>("semaine");
  const [deviseChoisie, setDeviseChoisie] = useState<string | null>(null);
  const [serieCA, setSerieCA] = useState<{ periode: PeriodeUI; data: SerieChiffreAffaires } | null>(null);
  const [serieMois, setSerieMois] = useState<SerieChiffreAffaires | null>(null);
  const [statsAbo, setStatsAbo] = useState<StatistiquesAbonnements | null>(null);
  const [erreurSeries, setErreurSeries] = useState<string | null>(null);

  // Courbe principale : relue au changement de période et à chaque synchronisation.
  useEffect(() => {
    let annule = false;
    getSerieChiffreAffaires(PERIODE_API[periodeCA], GRANULARITE_API[periodeCA])
      .then((data) => {
        if (annule) return;
        setSerieCA({ periode: periodeCA, data });
        setErreurSeries(null);
      })
      .catch((e: unknown) => {
        if (!annule) setErreurSeries(getApiError(e).message);
      });
    return () => {
      annule = true;
    };
  }, [periodeCA, version]);

  // Cartes compactes : toujours sur le mois en cours.
  useEffect(() => {
    let annule = false;
    Promise.all([
      getSerieChiffreAffaires(PERIODE_API.mois, GRANULARITE_API.mois),
      getStatistiquesAbonnements(PERIODE_API.mois),
    ])
      .then(([serie, stats]) => {
        if (annule) return;
        setSerieMois(serie);
        setStatsAbo(stats);
      })
      .catch((e: unknown) => {
        if (!annule) setErreurSeries(getApiError(e).message);
      });
    return () => {
      annule = true;
    };
  }, [version]);

  const devises = useMemo(() => {
    const liste = finances?.devises?.map((d) => d.devise) ?? [];
    return liste.length ? liste : finances ? [finances.devise] : [];
  }, [finances]);
  const devise = deviseChoisie && devises.includes(deviseChoisie) ? deviseChoisie : (finances?.devise ?? "XOF");

  const pointsCA = useMemo(
    () => (serieCA ? pointsChiffreAffaires(serieCA.data, devise, serieCA.periode) : []),
    [serieCA, devise],
  );
  const pointsMois = useMemo(() => pointsChiffreAffaires(serieMois, devise, "mois"), [serieMois, devise]);
  const alertes = useMemo(
    () => calculerAlertes(abonnements, paiements, fournisseurs, demandes),
    [abonnements, paiements, fournisseurs, demandes],
  );
  const demandesATraiter = useMemo(
    () => demandes.filter((d) => d.statut === "EN_ATTENTE" || d.statut === "EN_VERIFICATION").length,
    [demandes],
  );

  const sourceDevise = finances?.devises?.find((d) => d.devise === devise) ?? finances;
  const revenusMois = indicateursPeriode(sourceDevise, "mois");

  if (loading && !tableau) return <DashboardSkeleton />;
  if (error && !tableau) return <ErrorState message={error} onRetry={() => void refresh(false)} />;

  return (
    <div className="space-y-5">
      {(error || erreurSeries) && (
        <Alert variant="warning" title="Synchronisation incomplète">
          {error ?? erreurSeries} Les dernières données connues restent affichées.
        </Alert>
      )}

      {demandesATraiter > 0 && (
        <Link
          to="/admin/demandes"
          className="flex items-center justify-between gap-4 rounded-card border border-sun/40 bg-sun/20 px-5 py-4 text-ink shadow-sm transition-colors hover:border-sun/60 hover:bg-sun/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/30"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-amber-600">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {demandesATraiter} demande{demandesATraiter > 1 ? "s" : ""} d'abonnement à traiter
              </span>
              <span className="block text-xs text-muted">
                Vérifiez les justificatifs et confirmez ou refusez les paiements.
              </span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2.55fr)_minmax(0,1fr)]">
        <HeroFinancier tableau={tableau} finances={finances} actualise={lastUpdated} />
        <ChiffreAffairesPanel
          points={pointsCA}
          periode={periodeCA}
          onPeriodeChange={setPeriodeCA}
          devise={devise}
          devises={devises}
          onDeviseChange={setDeviseChoisie}
          chargement={!serieCA || serieCA.periode !== periodeCA}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RevenusCard
          points={pointsMois}
          montant={revenusMois.montant}
          devise={devise}
          evolution={revenusMois.evolution}
        />
        <AbonnementsCard stats={statsAbo} />
        <div className="md:col-span-2 *:h-full">
          <StatutsAbonnementsCard abonnements={abonnements} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FournisseursRecentsCard fournisseurs={fournisseurs} />
        <div className="md:order-last md:col-span-2 xl:order-0 *:h-full">
          <DernieresTransactionsCard paiements={paiements} />
        </div>
        <AlertesCard alertes={alertes} />
      </div>
    </div>
  );
}

export default AdminHome;
