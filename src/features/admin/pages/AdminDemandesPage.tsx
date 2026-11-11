import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Paperclip,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { StatCard } from "../../../shared/ui/stat-card";
import { getApiError } from "../../../services/apiError";
import {
  annulerDemandeAdmin,
  confirmerDemandeAdmin,
  refuserDemandeAdmin,
} from "../../../services/abonnementDemandeService";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import type {
  ConfirmationDemandePayload,
  DemandeAbonnement,
} from "../../../types/demandesAbonnement";
import {
  ActionBouton,
  Cell,
  DataPanel,
  FiltreSelect,
  ListPageHeader,
  MotifDialog,
  Toolbar,
} from "../components/ListPage";
import { useAdminData } from "../context/adminContextCore";
import { demandeStatus, estDemandeActive } from "../../../shared/utils/demandes";
import { useParametresListe } from "../lib/useParametresListe";
import { ConfirmationDemandeModal } from "../components/demandes/ConfirmationDemandeModal";
import { DemandeDetailModal } from "../components/demandes/DemandeDetailModal";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type MotifAction = "refuser" | "annuler";

export function AdminDemandesPage() {
  const { demandes, loading, error, refresh } = useAdminData();
  const { valeur, definir, signature } = useParametresListe(["q", "statut", "type"]);
  const [detail, setDetail] = useState<DemandeAbonnement | null>(null);
  const [confirmation, setConfirmation] = useState<DemandeAbonnement | null>(null);
  const [motifCible, setMotifCible] = useState<DemandeAbonnement | null>(null);
  const [motifAction, setMotifAction] = useState<MotifAction | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null);

  const q = norm(valeur("q"));
  const statut = valeur("statut");
  const type = valeur("type");

  const statistiques = useMemo(() => {
    const attente = demandes.filter((d) => d.statut === "EN_ATTENTE").length;
    const verification = demandes.filter((d) => d.statut === "EN_VERIFICATION").length;
    const confirmees = demandes.filter((d) => d.statut === "CONFIRMEE").length;
    return { attente, verification, confirmees };
  }, [demandes]);

  const lignes = useMemo(
    () =>
      demandes
        .filter((d) => {
          if (statut && d.statut !== statut) return false;
          if (type && d.type_operation !== type) return false;
          if (!q) return true;
          return [
            d.reference,
            d.reference_transaction,
            d.fournisseur.nom_entreprise,
            d.fournisseur.code_entreprise,
            d.plan_nom,
          ].some((c) => norm(c ?? "").includes(q));
        })
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [demandes, q, statut, type],
  );

  const rafraichir = async () => {
    await refresh(true);
  };

  const fermerTout = () => {
    setDetail(null);
    setConfirmation(null);
    setMotifCible(null);
    setMotifAction(null);
  };

  const confirmer = async (payload: ConfirmationDemandePayload) => {
    if (!confirmation) return;
    setEnCours(true);
    setMessage(null);
    try {
      await confirmerDemandeAdmin(confirmation.id, payload);
      setMessage({
        type: "success",
        texte: `La demande ${confirmation.reference} a été confirmée. L'abonnement est activé ou prolongé.`,
      });
      fermerTout();
      await rafraichir();
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
      setConfirmation(null);
    } finally {
      setEnCours(false);
    }
  };

  const executerMotif = async (motif: string) => {
    if (!motifCible || !motifAction) return;
    setEnCours(true);
    setMessage(null);
    try {
      if (motifAction === "refuser") {
        await refuserDemandeAdmin(motifCible.id, motif);
      } else {
        await annulerDemandeAdmin(motifCible.id, motif);
      }
      setMessage({
        type: "success",
        texte:
          motifAction === "refuser"
            ? `La demande ${motifCible.reference} a été refusée.`
            : `La demande ${motifCible.reference} a été annulée.`,
      });
      fermerTout();
      await rafraichir();
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
      setMotifCible(null);
      setMotifAction(null);
    } finally {
      setEnCours(false);
    }
  };

  if (loading && demandes.length === 0) return <Skeleton className="h-96 rounded-[1.75rem]" />;
  if (error && demandes.length === 0)
    return <ErrorState message={error} onRetry={() => void refresh(false)} />;

  return (
    <div className="space-y-5">
      <ListPageHeader
        titre="Demandes d'abonnement"
        description="Vérifiez les paiements déclarés par les fournisseurs et confirmez, refusez ou annulez les demandes."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void rafraichir()}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {message && <Alert variant={message.type}>{message.texte}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="À vérifier"
          value={statistiques.attente}
          hint="Demandes en attente de paiement"
          icon={<Clock3 className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="En vérification"
          value={statistiques.verification}
          hint="Preuve transmise, contrôle en cours"
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Confirmées"
          value={statistiques.confirmees}
          hint="Abonnements activés ou prolongés"
          icon={<FileCheck2 className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="Total"
          value={demandes.length}
          hint="Toutes demandes confondues"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="neutral"
        />
      </div>

      <Toolbar
        recherche={valeur("q")}
        onRecherche={(v) => definir({ q: v })}
        placeholder="Rechercher une référence, un fournisseur ou un plan"
      >
        <FiltreSelect
          label="Filtrer par statut"
          value={statut}
          onChange={(v) => definir({ statut: v })}
          options={[
            { value: "", label: "Tous les statuts" },
            { value: "EN_ATTENTE", label: "En attente" },
            { value: "EN_VERIFICATION", label: "En vérification" },
            { value: "CONFIRMEE", label: "Confirmées" },
            { value: "REFUSEE", label: "Refusées" },
            { value: "ANNULEE", label: "Annulées" },
            { value: "EXPIREE", label: "Expirées" },
            { value: "ECHEC", label: "Échecs" },
          ]}
        />
        <FiltreSelect
          label="Filtrer par opération"
          value={type}
          onChange={(v) => definir({ type: v })}
          options={[
            { value: "", label: "Toutes les opérations" },
            { value: "SOUSCRIPTION", label: "Souscriptions" },
            { value: "RENOUVELLEMENT", label: "Renouvellements" },
          ]}
        />
      </Toolbar>

      <DataPanel
        lignes={lignes}
        libelle="demande(s)"
        resetKey={signature}
        cle={(d) => d.id}
        entetes={["Référence", "Fournisseur", "Plan / Opération", "Montant", "Créée le", "Statut", ""]}
        vide="Aucune demande ne correspond à ces critères."
        rendu={(d) => {
          const config = demandeStatus(d.statut);
          const active = estDemandeActive(d.statut);
          return (
            <>
              <Cell>
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-ink">{d.reference}</p>
                  {d.preuve_paiement && (
                    <Paperclip className="h-3.5 w-3.5 text-muted" aria-label="Justificatif joint" />
                  )}
                </div>
                {d.reference_transaction && (
                  <p className="text-xs text-muted">{d.reference_transaction}</p>
                )}
              </Cell>
              <Cell>
                <p className="text-ink">{d.fournisseur.nom_entreprise}</p>
                <p className="text-xs text-muted">{d.fournisseur.code_entreprise}</p>
              </Cell>
              <Cell>
                <p className="text-ink">{d.plan_nom}</p>
                <p className="text-xs text-muted">{d.type_operation_display}</p>
              </Cell>
              <Cell className="whitespace-nowrap font-semibold text-ink">
                {formatMoney(d.montant, d.devise)}
                <span className="block text-xs font-normal text-muted">
                  {d.statut === "CONFIRMEE"
                    ? "Encaissé"
                    : active
                      ? "Attendu"
                      : "Non comptabilisé"}
                </span>
              </Cell>
              <Cell className="whitespace-nowrap text-muted">
                {formatDate(d.date_creation, true)}
              </Cell>
              <Cell>
                <Badge tone={config.tone}>{d.statut_display}</Badge>
              </Cell>
              <Cell>
                <div className="flex justify-end gap-1.5">
                  <ActionBouton
                    label={`Voir le détail de ${d.reference}`}
                    onClick={() => setDetail(d)}
                  >
                    <Eye className="h-4 w-4" />
                  </ActionBouton>
                  {active && (
                    <>
                      <ActionBouton
                        label={`Confirmer ${d.reference}`}
                        tone="success"
                        onClick={() => {
                          setDetail(null);
                          setConfirmation(d);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </ActionBouton>
                      <ActionBouton
                        label={`Refuser ${d.reference}`}
                        tone="danger"
                        onClick={() => {
                          setDetail(null);
                          setMotifCible(d);
                          setMotifAction("refuser");
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </ActionBouton>
                      <ActionBouton
                        label={`Annuler ${d.reference}`}
                        onClick={() => {
                          setDetail(null);
                          setMotifCible(d);
                          setMotifAction("annuler");
                        }}
                      >
                        <Ban className="h-4 w-4" />
                      </ActionBouton>
                    </>
                  )}
                </div>
              </Cell>
            </>
          );
        }}
      />

      <DemandeDetailModal
        key={detail?.id ?? "aucune-demande"}
        demande={detail}
        loadingAction={enCours}
        onClose={() => setDetail(null)}
        onConfirmer={(d) => {
          setDetail(null);
          setConfirmation(d);
        }}
        onRefuser={(d) => {
          setDetail(null);
          setMotifCible(d);
          setMotifAction("refuser");
        }}
        onAnnuler={(d) => {
          setDetail(null);
          setMotifCible(d);
          setMotifAction("annuler");
        }}
      />

      <ConfirmationDemandeModal
        key={confirmation?.id ?? "aucune-confirmation"}
        demande={confirmation}
        loading={enCours}
        onConfirm={(payload) => void confirmer(payload)}
        onClose={() => !enCours && setConfirmation(null)}
      />

      <MotifDialog
        open={motifAction === "refuser" && Boolean(motifCible)}
        titre="Refuser la demande"
        description={
          motifCible
            ? `La demande ${motifCible.reference} sera refusée. Le motif est communiqué au fournisseur.`
            : ""
        }
        confirmLabel="Refuser la demande"
        loading={enCours}
        onConfirm={(m) => void executerMotif(m)}
        onClose={() => {
          if (!enCours) {
            setMotifCible(null);
            setMotifAction(null);
          }
        }}
      />
      <MotifDialog
        open={motifAction === "annuler" && Boolean(motifCible)}
        titre="Annuler la demande"
        description={
          motifCible
            ? `La demande ${motifCible.reference} sera annulée.`
            : ""
        }
        confirmLabel="Annuler la demande"
        loading={enCours}
        onConfirm={(m) => void executerMotif(m)}
        onClose={() => {
          if (!enCours) {
            setMotifCible(null);
            setMotifAction(null);
          }
        }}
      />
    </div>
  );
}

export default AdminDemandesPage;
