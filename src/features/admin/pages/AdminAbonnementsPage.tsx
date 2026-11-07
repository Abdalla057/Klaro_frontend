import { useMemo, useState } from "react";
import { Ban, PauseCircle, PlayCircle, RefreshCw, RotateCw } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { getApiError } from "../../../services/apiError";
import {
  annulerAbonnement,
  reactiverAbonnement,
  renouvelerAbonnement,
  suspendreAbonnement,
} from "../../../services/superAdminService";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import type { AbonnementAdmin } from "../../../types/superAdmin";
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
import { SEUIL_EXPIRATION_JOURS, statutAbonnement } from "../lib/dashboard";
import { abonnementStatus } from "../lib/status";
import { useParametresListe } from "../lib/useParametresListe";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Action = "renouveler" | "suspendre" | "reactiver" | "annuler";

const TEXTES: Record<Action, { passe: string }> = {
  renouveler: { passe: "renouvelé" },
  suspendre: { passe: "suspendu" },
  reactiver: { passe: "réactivé" },
  annuler: { passe: "annulé" },
};

function identifiantUnique() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AdminAbonnementsPage() {
  const { abonnements, loading, error, refresh } = useAdminData();
  const { valeur, definir, signature } = useParametresListe(["q", "statut", "filtre"]);
  const [cible, setCible] = useState<AbonnementAdmin | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null);

  const q = norm(valeur("q"));
  const statut = valeur("statut");
  const expiration = valeur("filtre") === "expiration";

  const lignes = useMemo(
    () =>
      abonnements
        .filter((a) => {
          if (expiration) {
            if (statutAbonnement(a) !== "ACTIF" || a.jours_restants < 0 || a.jours_restants > SEUIL_EXPIRATION_JOURS) {
              return false;
            }
          } else if (statut && statutAbonnement(a) !== statut) {
            return false;
          }
          if (!q) return true;
          return [a.fournisseur.nom_entreprise, a.plan.nom, a.reference_paiement].some((c) => norm(c ?? "").includes(q));
        })
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [abonnements, q, statut, expiration],
  );

  const fermer = () => {
    setCible(null);
    setAction(null);
  };

  const executer = async (motif?: string) => {
    if (!cible || !action) return;
    setEnCours(true);
    try {
      if (action === "renouveler") await renouvelerAbonnement(cible.id, { cle_idempotence: identifiantUnique() });
      else if (action === "suspendre") await suspendreAbonnement(cible.id, motif ?? "");
      else if (action === "annuler") await annulerAbonnement(cible.id, motif ?? "");
      else await reactiverAbonnement(cible.id);
      setMessage({
        type: "success",
        texte: `L'abonnement de ${cible.fournisseur.nom_entreprise} a été ${TEXTES[action].passe}.`,
      });
      fermer();
      await refresh(true);
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
      fermer();
    } finally {
      setEnCours(false);
    }
  };

  const ouvrir = (a: AbonnementAdmin, type: Action) => {
    setCible(a);
    setAction(type);
  };

  if (loading && abonnements.length === 0) return <Skeleton className="h-96 rounded-[1.75rem]" />;
  if (error && abonnements.length === 0) return <ErrorState message={error} onRetry={() => void refresh(false)} />;

  const nom = cible?.fournisseur.nom_entreprise ?? "";

  return (
    <div className="space-y-4">
      <ListPageHeader
        titre="Abonnements"
        description="Tous les abonnements souscrits par les fournisseurs : renouvelez, suspendez, réactivez ou annulez."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh(true)}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {message && <Alert variant={message.type}>{message.texte}</Alert>}

      <Toolbar
        recherche={valeur("q")}
        onRecherche={(v) => definir({ q: v })}
        placeholder="Rechercher un fournisseur ou un plan"
      >
        <FiltreSelect
          label="Filtrer par statut"
          value={expiration ? "expiration" : statut}
          onChange={(v) =>
            definir({ filtre: v === "expiration" ? "expiration" : "", statut: v === "expiration" ? "" : v })
          }
          options={[
            { value: "", label: "Tous les statuts" },
            { value: "ACTIF", label: "Actifs" },
            { value: "expiration", label: `Expirent sous ${SEUIL_EXPIRATION_JOURS} jours` },
            { value: "EXPIRE", label: "Expirés" },
            { value: "SUSPENDU", label: "Suspendus" },
            { value: "ANNULE", label: "Annulés" },
          ]}
        />
      </Toolbar>

      <DataPanel
        lignes={lignes}
        libelle="abonnement(s)"
        resetKey={signature}
        cle={(a) => a.id}
        entetes={["Fournisseur", "Plan", "Période", "Montant", "Statut", ""]}
        vide="Aucun abonnement ne correspond à ces critères."
        rendu={(a) => {
          const s = statutAbonnement(a);
          const config = abonnementStatus(s);
          return (
            <>
              <Cell>
                <p className="font-semibold text-ink">{a.fournisseur.nom_entreprise}</p>
                <p className="text-xs text-muted">{a.fournisseur.code_entreprise}</p>
              </Cell>
              <Cell>
                <span className="text-ink">{a.plan.nom}</span>
                {a.est_essai && <Badge tone="warning" className="ml-2">Essai</Badge>}
              </Cell>
              <Cell>
                <p className="text-ink">
                  {formatDate(a.date_debut)} → {formatDate(a.date_fin)}
                </p>
                {s === "ACTIF" && <p className="text-xs text-muted">{a.jours_restants} jour(s) restant(s)</p>}
              </Cell>
              <Cell className="whitespace-nowrap text-ink">{formatMoney(a.montant, a.devise)}</Cell>
              <Cell>
                <Badge tone={config.tone}>{config.label}</Badge>
              </Cell>
              <Cell>
                <div className="flex justify-end gap-1.5">
                  {(s === "ACTIF" || s === "EXPIRE") && (
                    <ActionBouton label={`Renouveler l'abonnement de ${a.fournisseur.nom_entreprise}`} tone="success" onClick={() => ouvrir(a, "renouveler")}>
                      <RotateCw className="h-4 w-4" />
                    </ActionBouton>
                  )}
                  {s === "ACTIF" && (
                    <ActionBouton label={`Suspendre l'abonnement de ${a.fournisseur.nom_entreprise}`} onClick={() => ouvrir(a, "suspendre")}>
                      <PauseCircle className="h-4 w-4" />
                    </ActionBouton>
                  )}
                  {s === "SUSPENDU" && (
                    <ActionBouton label={`Réactiver l'abonnement de ${a.fournisseur.nom_entreprise}`} tone="success" onClick={() => ouvrir(a, "reactiver")}>
                      <PlayCircle className="h-4 w-4" />
                    </ActionBouton>
                  )}
                  {(s === "ACTIF" || s === "SUSPENDU") && (
                    <ActionBouton label={`Annuler l'abonnement de ${a.fournisseur.nom_entreprise}`} tone="danger" onClick={() => ouvrir(a, "annuler")}>
                      <Ban className="h-4 w-4" />
                    </ActionBouton>
                  )}
                </div>
              </Cell>
            </>
          );
        }}
      />

      <MotifDialog
        open={action === "suspendre" && !!cible}
        titre="Suspendre l'abonnement"
        description={`Le service de ${nom} sera interrompu jusqu'à réactivation.`}
        confirmLabel="Suspendre"
        loading={enCours}
        onConfirm={(m) => void executer(m)}
        onClose={fermer}
      />
      <MotifDialog
        open={action === "annuler" && !!cible}
        titre="Annuler l'abonnement"
        description={`L'abonnement de ${nom} sera définitivement annulé.`}
        confirmLabel="Annuler l'abonnement"
        loading={enCours}
        onConfirm={(m) => void executer(m)}
        onClose={fermer}
      />
      <ConfirmDialog
        open={action === "renouveler" && !!cible}
        title="Renouveler l'abonnement"
        description={`L'abonnement de ${nom} sera renouvelé avec son plan actuel. Le paiement associé apparaîtra dans la liste des paiements.`}
        confirmLabel="Renouveler"
        tone="default"
        loading={enCours}
        onConfirm={() => void executer()}
        onClose={fermer}
      />
      <ConfirmDialog
        open={action === "reactiver" && !!cible}
        title="Réactiver l'abonnement"
        description={`Le service de ${nom} sera rétabli.`}
        confirmLabel="Réactiver"
        tone="default"
        loading={enCours}
        onConfirm={() => void executer()}
        onClose={fermer}
      />
    </div>
  );
}

export default AdminAbonnementsPage;
