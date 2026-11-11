import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Check,
  CreditCard,
  FileClock,
  History,
  Info,
  RefreshCw,
  Receipt,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { ErrorState } from "../../../shared/ui/error-state";
import { CardSkeleton } from "../../../shared/ui/loading";
import { PageHeader } from "../../../shared/ui/page-header";
import { getApiError } from "../../../services/apiError";
import {
  annulerDemandeFournisseur,
  creerDemandeAbonnement,
  getDemandesFournisseur,
  getHistoriqueAbonnementsFournisseur,
  getHistoriquePaiementsFournisseur,
  getPlansDisponibles,
  soumettrePaiementDemande,
} from "../../../services/abonnementDemandeService";
import type {
  DemandeAbonnement,
  DemandeAbonnementCreationPayload,
  DemandeTypeOperation,
  SoumissionPaiementPayload,
} from "../../../types/demandesAbonnement";
import type {
  AbonnementAdmin,
  PaiementAbonnement,
  PlanAbonnement,
} from "../../../types/superAdmin";
import {
  demandeStatus,
  estDemandeActive,
  libelleMoyenPaiement,
} from "../../../shared/utils/demandes";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate, formatMoney } from "../lib/format";
import { abonnementStatusLabel, abonnementStatusTone } from "../lib/status";
import { CreationDemandeModal } from "../components/demandes/CreationDemandeModal";
import { DemandeFournisseurDetailModal } from "../components/demandes/DemandeFournisseurDetailModal";
import { SoumissionPaiementModal } from "../components/demandes/SoumissionPaiementModal";

type Onglet = "demandes" | "abonnements" | "paiements";
type Message = { type: "success" | "error" | "warning"; texte: string };

const TON_PAIEMENT: Record<string, "success" | "warning" | "danger" | "neutral" | "info"> = {
  INITIE: "info",
  EN_ATTENTE: "warning",
  EN_VERIFICATION: "info",
  CONFIRME: "success",
  REFUSE: "danger",
  ECHEC: "danger",
  ANNULE: "neutral",
  REMBOURSE: "neutral",
};

async function recupererListes() {
  const [p, d, a, pa] = await Promise.allSettled([
    getPlansDisponibles(),
    getDemandesFournisseur(),
    getHistoriqueAbonnementsFournisseur(),
    getHistoriquePaiementsFournisseur(),
  ]);
  const echec = [p, d, a, pa].find((resultat) => resultat.status === "rejected");
  return {
    plans: p.status === "fulfilled" ? p.value.items : null,
    demandes: d.status === "fulfilled" ? d.value.items : null,
    abonnements: a.status === "fulfilled" ? a.value.items : null,
    paiements: pa.status === "fulfilled" ? pa.value.items : null,
    erreur:
      echec && echec.status === "rejected" ? getApiError(echec.reason).message : null,
  };
}

function QuotaBar({
  label,
  used,
  max,
  icon,
}: {
  label: string;
  used: number;
  max: number | null;
  icon: ReactNode;
}) {
  const percent = max === null ? 100 : max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
            {icon}
          </span>
          <p className="text-sm font-medium text-ink">{label}</p>
        </div>
        <p className="text-sm font-semibold text-ink">
          {used}
          <span className="font-normal text-muted">
            {max === null ? " / illimité" : ` / ${max}`}
          </span>
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-soft">
        <div className="h-full rounded-full bg-brand-accent" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {max === null
          ? "Aucune limite définie par votre plan."
          : `${Math.max(0, max - used)} place${max - used > 1 ? "s" : ""} restante${max - used > 1 ? "s" : ""}.`}
      </p>
    </div>
  );
}

export function AbonnementPage() {
  const { abonnement, loading, error, refresh } = useFournisseur();
  const [plans, setPlans] = useState<PlanAbonnement[]>([]);
  const [demandes, setDemandes] = useState<DemandeAbonnement[]>([]);
  const [historiqueAbonnements, setHistoriqueAbonnements] = useState<AbonnementAdmin[]>([]);
  const [historiquePaiements, setHistoriquePaiements] = useState<PaiementAbonnement[]>([]);
  const [chargementListes, setChargementListes] = useState(true);
  const [erreurListes, setErreurListes] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("demandes");
  const [planChoisi, setPlanChoisi] = useState<PlanAbonnement | null>(null);
  const [detail, setDetail] = useState<DemandeAbonnement | null>(null);
  const [paiementCible, setPaiementCible] = useState<DemandeAbonnement | null>(null);
  const [annulation, setAnnulation] = useState<DemandeAbonnement | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    let annule = false;
    recupererListes()
      .then((resultat) => {
        if (annule) return;
        if (resultat.plans) setPlans(resultat.plans);
        if (resultat.demandes) setDemandes(resultat.demandes);
        if (resultat.abonnements) setHistoriqueAbonnements(resultat.abonnements);
        if (resultat.paiements) setHistoriquePaiements(resultat.paiements);
        setErreurListes(resultat.erreur);
        setChargementListes(false);
      })
      .catch((e: unknown) => {
        if (annule) return;
        setErreurListes(getApiError(e).message);
        setChargementListes(false);
      });

    return () => {
      annule = true;
    };
  }, []);

  const rafraichir = async () => {
    const resultat = await recupererListes();
    if (resultat.plans) setPlans(resultat.plans);
    if (resultat.demandes) setDemandes(resultat.demandes);
    if (resultat.abonnements) setHistoriqueAbonnements(resultat.abonnements);
    if (resultat.paiements) setHistoriquePaiements(resultat.paiements);
    setErreurListes(resultat.erreur);
    refresh();
  };

  const demandesTriees = useMemo(
    () =>
      [...demandes].sort(
        (a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
      ),
    [demandes],
  );
  const abonnementsTries = useMemo(
    () =>
      [...historiqueAbonnements].sort(
        (a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime(),
      ),
    [historiqueAbonnements],
  );
  const paiementsTries = useMemo(
    () =>
      [...historiquePaiements].sort(
        (a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime(),
      ),
    [historiquePaiements],
  );

  const demandeActive = useMemo(
    () => demandesTriees.find((d) => estDemandeActive(d.statut)) ?? null,
    [demandesTriees],
  );

  const abonnementExistant = abonnement?.abonnement ?? null;
  const essaiEnCours = Boolean(abonnementExistant?.est_essai || abonnement?.plan?.est_essai);
  const operation: DemandeTypeOperation =
    !abonnementExistant || abonnementExistant.statut === "ANNULE" || essaiEnCours
      ? "SOUSCRIPTION"
      : "RENOUVELLEMENT";
  const abonnementCible =
    operation === "RENOUVELLEMENT" ? (abonnementExistant?.id ?? null) : null;
  const planActifId =
    abonnement?.plan?.id ??
    plans.find((plan) => plan.nom === abonnementExistant?.plan_nom)?.id ??
    null;
  const estActifPayant = Boolean(abonnement?.est_actif) && !essaiEnCours;

  const creer = async (payload: DemandeAbonnementCreationPayload) => {
    setEnCours(true);
    setMessage(null);
    try {
      const creee = await creerDemandeAbonnement(payload);
      let finale = creee;
      let erreurSoumission: string | null = null;

      if (
        creee.statut === "EN_ATTENTE" &&
        (payload.reference_transaction || payload.preuve_paiement)
      ) {
        try {
          finale = await soumettrePaiementDemande(creee.id, {
            reference_transaction: payload.reference_transaction,
            preuve_paiement: payload.preuve_paiement,
            moyen_paiement: payload.moyen_paiement,
            prestataire: payload.prestataire,
            commentaire: payload.commentaire_fournisseur,
          });
        } catch (e) {
          erreurSoumission = getApiError(e).message;
        }
      }

      setPlanChoisi(null);
      await rafraichir();
      setDetail(finale);
      setMessage(
        erreurSoumission
          ? {
              type: "warning",
              texte: `Demande ${finale.reference} créée, mais le justificatif n'a pas pu être transmis : ${erreurSoumission}`,
            }
          : {
              type: "success",
              texte: `Demande ${finale.reference} enregistrée. KLARO va vérifier votre paiement.`,
            },
      );
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
    } finally {
      setEnCours(false);
    }
  };

  const soumettre = async (payload: SoumissionPaiementPayload) => {
    if (!paiementCible) return;
    setEnCours(true);
    setMessage(null);
    try {
      const maj = await soumettrePaiementDemande(paiementCible.id, payload);
      setPaiementCible(null);
      await rafraichir();
      setDetail(maj);
      setMessage({
        type: "success",
        texte: "Votre justificatif a été transmis. La demande est en vérification.",
      });
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
    } finally {
      setEnCours(false);
    }
  };

  const annuler = async () => {
    if (!annulation) return;
    setEnCours(true);
    setMessage(null);
    try {
      await annulerDemandeFournisseur(annulation.id, "");
      setMessage({ type: "success", texte: `La demande ${annulation.reference} a été annulée.` });
      setAnnulation(null);
      setDetail(null);
      await rafraichir();
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
      setAnnulation(null);
    } finally {
      setEnCours(false);
    }
  };

  if (loading && !abonnement && plans.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Mon abonnement
          </h1>
          <p className="mt-1 text-sm text-muted">
            Consultez votre plan, vos quotas, vos demandes et vos paiements.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton className="lg:col-span-2" />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const plansDisponibles = plans.filter((plan) => plan.actif && !plan.est_essai);
  const planNom = abonnement?.plan?.nom ?? abonnementExistant?.plan_nom ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon abonnement"
        description="Gérez votre plan, transmettez vos paiements et suivez leur vérification."
        actions={
          <div className="flex items-center gap-2">
            {abonnement && (
              <Badge tone={abonnementStatusTone(abonnement.statut, abonnement.est_actif)}>
                {abonnementStatusLabel(abonnement.statut, abonnement.est_actif)}
              </Badge>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => void rafraichir()}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        }
      />

      {message && <Alert variant={message.type}>{message.texte}</Alert>}
      {erreurListes && <Alert variant="warning" title="Chargement partiel">{erreurListes}</Alert>}

      {demandeActive && (
        <Alert variant="info" title="Une demande est en cours">
          La demande <span className="font-semibold">{demandeActive.reference}</span> est{" "}
          {demandeStatutLabel(demandeActive).toLowerCase()}. Vous ne pouvez pas créer une nouvelle
          demande tant qu'elle n'est pas traitée ou annulée.
        </Alert>
      )}

      {abonnement && (
        <>
          {!abonnement.est_actif && (
            <Alert variant="warning" title="Abonnement inactif">
              Votre abonnement est {abonnementStatusLabel(abonnement.statut, abonnement.est_actif).toLowerCase()}.
              Les créations de clients et d'agents sont désactivées. Renouvelez ou souscrivez un
              plan ci-dessous.
            </Alert>
          )}

          {abonnement.plan?.est_essai && (
            <Alert variant="info" title="Période d'essai">
              Vous bénéficiez actuellement de la période d'essai gratuite.
            </Alert>
          )}
        </>
      )}

      {abonnement ? (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Plan actuel</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {planNom ?? "Aucun plan"}
                </h2>
                {abonnement.plan?.description && (
                  <p className="mt-1 max-w-xl text-sm text-muted">{abonnement.plan.description}</p>
                )}
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <CreditCard className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>

            <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Début
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {formatDate(abonnement.date_debut ?? abonnementExistant?.date_debut)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Échéance
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {formatDate(abonnement.date_fin ?? abonnementExistant?.date_fin)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Jours restants</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{abonnement.jours_restants}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Montant</dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {formatMoney(
                    abonnementExistant?.montant ?? abonnement.plan?.prix,
                    abonnementExistant?.devise ?? abonnement.plan?.devise,
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink">Droits de création</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Clients
                  </span>
                  <Badge tone={abonnement.peut_creer_client ? "success" : "neutral"}>
                    {abonnement.peut_creer_client ? "Autorisé" : "Indisponible"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-muted">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Agents
                  </span>
                  <Badge tone={abonnement.peut_creer_agent ? "success" : "neutral"}>
                    {abonnement.peut_creer_agent ? "Autorisé" : "Indisponible"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink">Quotas</h2>
              <div className="mt-4 space-y-4">
                <QuotaBar
                  label="Clients"
                  used={abonnement.utilisation?.clients ?? 0}
                  max={abonnement.quotas?.clients ?? null}
                  icon={<Users className="h-4 w-4" aria-hidden="true" />}
                />
                <QuotaBar
                  label="Agents"
                  used={abonnement.utilisation?.agents ?? 0}
                  max={abonnement.quotas?.agents ?? null}
                  icon={<UserRound className="h-4 w-4" aria-hidden="true" />}
                />
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <Alert variant="info" title="Aucun abonnement">
          Choisissez un plan ci-dessous pour créer votre première demande d'abonnement.
        </Alert>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">Plans disponibles</h2>
            <p className="text-sm text-muted">
              Le montant attendu est déterminé par le serveur à partir du plan sélectionné.
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
            Paiement manuel vérifié par KLARO
          </p>
        </div>

        {chargementListes && plansDisponibles.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : plansDisponibles.length === 0 ? (
          <Alert variant="warning">
            Aucun plan payant n'est disponible pour le moment. L'essai gratuit est attribué
            automatiquement à l'inscription et ne peut pas être souscrit manuellement.
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plansDisponibles.map((plan) => {
              const estPlanActuel = plan.id === planActifId;
              const changementImpossible = estActifPayant && !estPlanActuel;
              const actionDesactivee = Boolean(demandeActive) || changementImpossible;
              return (
                <article
                  key={plan.id}
                  className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-ink">{plan.nom}</h3>
                      <p className="mt-1 text-sm text-muted">{plan.description || "Plan d'abonnement KLARO."}</p>
                    </div>
                    {estPlanActuel && <Badge tone="brand">Plan actuel</Badge>}
                    {plan.est_essai && !estPlanActuel && <Badge tone="info">Essai</Badge>}
                  </div>

                  <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">
                    {formatMoney(plan.prix, plan.devise)}
                  </p>
                  <p className="text-xs text-muted">pour {plan.duree_jours} jours</p>

                  <ul className="mt-4 space-y-2 text-sm text-ink">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-brand" aria-hidden="true" />
                      {plan.max_clients === null ? "Clients illimités" : `${plan.max_clients} clients`}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-brand" aria-hidden="true" />
                      {plan.max_agents === null ? "Agents illimités" : `${plan.max_agents} agents`}
                    </li>
                  </ul>

                  <div className="mt-5 flex-1" />

                  {demandeActive ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDetail(demandeActive)}
                    >
                      Demande en cours
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant={estPlanActuel ? "default" : "outline"}
                      onClick={() => setPlanChoisi(plan)}
                      disabled={actionDesactivee}
                    >
                      {changementImpossible
                        ? "Modifiable à l'expiration"
                        : operation === "RENOUVELLEMENT"
                          ? "Renouveler"
                          : "Souscrire"}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <p>
            Le paiement en ligne n'est pas proposé tant que les moyens de paiement ne sont pas
            exposés par le backend. Transmettez une référence de transaction et un justificatif ;
            ils seront vérifiés par KLARO. Un justificatif ne confirme jamais automatiquement le
            paiement.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          <OngletBouton
            actif={onglet === "demandes"}
            onClick={() => setOnglet("demandes")}
            icone={<FileClock className="h-4 w-4" aria-hidden="true" />}
            libelle={`Demandes (${demandesTriees.length})`}
          />
          <OngletBouton
            actif={onglet === "abonnements"}
            onClick={() => setOnglet("abonnements")}
            icone={<History className="h-4 w-4" aria-hidden="true" />}
            libelle={`Abonnements (${abonnementsTries.length})`}
          />
          <OngletBouton
            actif={onglet === "paiements"}
            onClick={() => setOnglet("paiements")}
            icone={<Receipt className="h-4 w-4" aria-hidden="true" />}
            libelle={`Paiements (${paiementsTries.length})`}
          />
        </div>

        <div className="p-4 sm:p-5">
          {chargementListes ? (
            <p className="text-sm text-muted">Chargement…</p>
          ) : onglet === "demandes" ? (
            demandesTriees.length === 0 ? (
              <p className="text-sm text-muted">Aucune demande d'abonnement pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <th className="px-2 py-2 font-medium">Référence</th>
                      <th className="px-2 py-2 font-medium">Plan</th>
                      <th className="px-2 py-2 font-medium">Montant</th>
                      <th className="px-2 py-2 font-medium">Créée le</th>
                      <th className="px-2 py-2 font-medium">Statut</th>
                      <th className="px-2 py-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandesTriees.map((demande) => {
                      const config = demandeStatus(demande.statut);
                      return (
                        <tr key={demande.id} className="border-b border-border/70 last:border-0">
                          <td className="px-2 py-3">
                            <p className="font-medium text-ink">{demande.reference}</p>
                            <p className="text-xs text-muted">{demande.type_operation_display}</p>
                          </td>
                          <td className="px-2 py-3 text-ink">{demande.plan_nom}</td>
                          <td className="px-2 py-3 whitespace-nowrap font-medium text-ink">
                            {formatMoney(demande.montant, demande.devise)}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-muted">
                            {formatDate(demande.date_creation, true)}
                          </td>
                          <td className="px-2 py-3">
                            <Badge tone={config.tone}>{config.label}</Badge>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setDetail(demande)}>
                              Détails
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : onglet === "abonnements" ? (
            abonnementsTries.length === 0 ? (
              <p className="text-sm text-muted">Aucun abonnement enregistré.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <th className="px-2 py-2 font-medium">Plan</th>
                      <th className="px-2 py-2 font-medium">Période</th>
                      <th className="px-2 py-2 font-medium">Montant</th>
                      <th className="px-2 py-2 font-medium">Statut</th>
                      <th className="px-2 py-2 font-medium">Référence paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abonnementsTries.map((item) => (
                      <tr key={item.id} className="border-b border-border/70 last:border-0">
                        <td className="px-2 py-3 font-medium text-ink">{item.plan.nom}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-muted">
                          {formatDate(item.date_debut)} → {formatDate(item.date_fin)}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap font-medium text-ink">
                          {formatMoney(item.montant, item.devise)}
                        </td>
                        <td className="px-2 py-3">
                          <Badge tone={item.est_actif ? "success" : item.statut === "ANNULE" ? "danger" : "neutral"}>
                            {item.statut_effectif || item.statut}
                          </Badge>
                        </td>
                        <td className="px-2 py-3 text-muted">{item.reference_paiement || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : paiementsTries.length === 0 ? (
            <p className="text-sm text-muted">Aucun paiement enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="px-2 py-2 font-medium">Référence</th>
                    <th className="px-2 py-2 font-medium">Plan</th>
                    <th className="px-2 py-2 font-medium">Moyen</th>
                    <th className="px-2 py-2 font-medium">Montant</th>
                    <th className="px-2 py-2 font-medium">Date</th>
                    <th className="px-2 py-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paiementsTries.map((paiement) => (
                    <tr key={paiement.id} className="border-b border-border/70 last:border-0">
                      <td className="px-2 py-3">
                        <p className="font-medium text-ink">{paiement.reference}</p>
                        {paiement.demande_reference && (
                          <p className="text-xs text-muted">Demande {paiement.demande_reference}</p>
                        )}
                      </td>
                      <td className="px-2 py-3 text-ink">{paiement.plan_nom}</td>
                      <td className="px-2 py-3 text-muted">
                        {libelleMoyenPaiement(paiement.moyen_paiement, paiement.moyen_paiement_display)}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap font-medium text-ink">
                        {formatMoney(paiement.montant, paiement.devise)}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-muted">
                        {formatDate(paiement.date_creation, true)}
                      </td>
                      <td className="px-2 py-3">
                        <Badge tone={TON_PAIEMENT[paiement.statut] ?? "neutral"}>
                          {paiement.statut_display}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <CreationDemandeModal
        key={planChoisi?.id ?? "aucun-plan"}
        plan={planChoisi}
        operation={operation}
        abonnementCible={abonnementCible}
        loading={enCours}
        onCreer={(payload) => void creer(payload)}
        onClose={() => !enCours && setPlanChoisi(null)}
      />

      <DemandeFournisseurDetailModal
        key={detail ? `${detail.id}-${detail.date_modification}` : "aucune-demande"}
        demande={detail}
        loadingAction={enCours}
        onClose={() => setDetail(null)}
        onSoumettrePaiement={(demande) => {
          setDetail(null);
          setPaiementCible(demande);
        }}
        onAnnuler={(demande) => {
          setDetail(null);
          setAnnulation(demande);
        }}
      />

      <SoumissionPaiementModal
        key={paiementCible?.id ?? "aucun-paiement"}
        demande={paiementCible}
        loading={enCours}
        onSoumettre={(payload) => void soumettre(payload)}
        onClose={() => !enCours && setPaiementCible(null)}
      />

      <ConfirmDialog
        open={Boolean(annulation)}
        title="Annuler la demande"
        description={
          annulation
            ? `La demande ${annulation.reference} sera annulée. Vous pourrez en créer une nouvelle ensuite.`
            : ""
        }
        confirmLabel="Annuler la demande"
        loading={enCours}
        onConfirm={() => void annuler()}
        onClose={() => !enCours && setAnnulation(null)}
      />
    </div>
  );
}

function demandeStatutLabel(demande: DemandeAbonnement): string {
  return demande.statut_display || demande.statut;
}

function OngletBouton({
  actif,
  onClick,
  icone,
  libelle,
}: {
  actif: boolean;
  onClick: () => void;
  icone: ReactNode;
  libelle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/30 ${
        actif ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface hover:text-ink"
      }`}
    >
      {icone}
      {libelle}
    </button>
  );
}
