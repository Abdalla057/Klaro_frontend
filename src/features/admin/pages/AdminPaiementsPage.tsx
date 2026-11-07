import { useMemo, useState } from "react";
import { Ban, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { getApiError } from "../../../services/apiError";
import { annulerPaiement, confirmerPaiement, refuserPaiement } from "../../../services/superAdminService";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import type { PaiementAbonnement } from "../../../types/superAdmin";
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
import { MOYEN_PAIEMENT, TYPE_OPERATION, paiementStatus } from "../lib/status";
import { useParametresListe } from "../lib/useParametresListe";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Action = "confirmer" | "refuser" | "annuler";
const PASSE: Record<Action, string> = { confirmer: "confirmé", refuser: "refusé", annuler: "annulé" };

export function AdminPaiementsPage() {
  const { paiements, loading, error, refresh } = useAdminData();
  const { valeur, definir, signature } = useParametresListe(["q", "statut", "type"]);
  const [cible, setCible] = useState<PaiementAbonnement | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null);

  const q = norm(valeur("q"));
  const statut = valeur("statut");
  const type = valeur("type");

  const lignes = useMemo(
    () =>
      paiements
        .filter((p) => {
          if (statut && p.statut !== statut) return false;
          if (type && p.type_operation !== type) return false;
          if (!q) return true;
          return [p.reference, p.reference_transaction, p.fournisseur.nom_entreprise].some((c) =>
            norm(c ?? "").includes(q),
          );
        })
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [paiements, q, statut, type],
  );

  const fermer = () => {
    setCible(null);
    setAction(null);
  };

  const executer = async (motif?: string) => {
    if (!cible || !action) return;
    setEnCours(true);
    try {
      if (action === "confirmer") await confirmerPaiement(cible.id);
      else if (action === "refuser") await refuserPaiement(cible.id, motif ?? "");
      else await annulerPaiement(cible.id, motif ?? "");
      setMessage({ type: "success", texte: `Le paiement ${cible.reference} a été ${PASSE[action]}.` });
      fermer();
      // Le chiffre d'affaires, les statistiques et le tableau de bord sont relus immédiatement.
      await refresh(true);
    } catch (e) {
      setMessage({ type: "error", texte: getApiError(e).message });
      fermer();
    } finally {
      setEnCours(false);
    }
  };

  const ouvrir = (p: PaiementAbonnement, a: Action) => {
    setCible(p);
    setAction(a);
  };

  if (loading && paiements.length === 0) return <Skeleton className="h-96 rounded-[1.75rem]" />;
  if (error && paiements.length === 0) return <ErrorState message={error} onRetry={() => void refresh(false)} />;

  return (
    <div className="space-y-4">
      <ListPageHeader
        titre="Paiements"
        description="Historique complet des paiements d'abonnement. Seuls les paiements confirmés comptent dans le chiffre d'affaires."
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
        placeholder="Rechercher une référence ou un fournisseur"
      >
        <FiltreSelect
          label="Filtrer par statut"
          value={statut}
          onChange={(v) => definir({ statut: v })}
          options={[
            { value: "", label: "Tous les statuts" },
            { value: "EN_ATTENTE", label: "En attente" },
            { value: "CONFIRME", label: "Confirmés" },
            { value: "REFUSE", label: "Refusés" },
            { value: "ANNULE", label: "Annulés" },
          ]}
        />
        <FiltreSelect
          label="Filtrer par type d'opération"
          value={type}
          onChange={(v) => definir({ type: v })}
          options={[
            { value: "", label: "Toutes les opérations" },
            { value: "SOUSCRIPTION", label: "Souscriptions" },
            { value: "RENOUVELLEMENT", label: "Renouvellements" },
            { value: "REGULARISATION", label: "Régularisations" },
          ]}
        />
      </Toolbar>

      <DataPanel
        lignes={lignes}
        libelle="paiement(s)"
        resetKey={signature}
        cle={(p) => p.id}
        entetes={["Référence", "Fournisseur", "Opération", "Montant", "Date", "Statut", ""]}
        vide="Aucun paiement ne correspond à ces critères."
        rendu={(p) => {
          const config = paiementStatus(p.statut);
          return (
            <>
              <Cell>
                <p className="font-semibold text-ink">{p.reference}</p>
                {p.moyen_paiement && (
                  <p className="text-xs text-muted">{MOYEN_PAIEMENT[p.moyen_paiement] ?? p.moyen_paiement_display}</p>
                )}
              </Cell>
              <Cell>
                <p className="text-ink">{p.fournisseur.nom_entreprise}</p>
                <p className="text-xs text-muted">Plan {p.plan_nom}</p>
              </Cell>
              <Cell className="text-ink">{TYPE_OPERATION[p.type_operation] ?? p.type_operation}</Cell>
              <Cell className="whitespace-nowrap font-semibold text-ink">{formatMoney(p.montant, p.devise)}</Cell>
              <Cell className="whitespace-nowrap text-muted">
                {formatDate(p.date_confirmation ?? p.date_creation, true)}
              </Cell>
              <Cell>
                <Badge tone={config.tone}>{config.label}</Badge>
              </Cell>
              <Cell>
                <div className="flex justify-end gap-1.5">
                  {p.statut === "EN_ATTENTE" && (
                    <>
                      <ActionBouton label={`Confirmer le paiement ${p.reference}`} tone="success" onClick={() => ouvrir(p, "confirmer")}>
                        <CheckCircle2 className="h-4 w-4" />
                      </ActionBouton>
                      <ActionBouton label={`Refuser le paiement ${p.reference}`} tone="danger" onClick={() => ouvrir(p, "refuser")}>
                        <XCircle className="h-4 w-4" />
                      </ActionBouton>
                      <ActionBouton label={`Annuler le paiement ${p.reference}`} onClick={() => ouvrir(p, "annuler")}>
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

      <ConfirmDialog
        open={action === "confirmer" && !!cible}
        title="Confirmer ce paiement"
        description={
          cible
            ? `${formatMoney(cible.montant, cible.devise)} de ${cible.fournisseur.nom_entreprise} seront ajoutés au chiffre d'affaires.`
            : ""
        }
        confirmLabel="Confirmer le paiement"
        tone="default"
        loading={enCours}
        onConfirm={() => void executer()}
        onClose={fermer}
      />
      <MotifDialog
        open={action === "refuser" && !!cible}
        titre="Refuser ce paiement"
        description={cible ? `Le paiement ${cible.reference} ne sera pas comptabilisé.` : ""}
        confirmLabel="Refuser"
        loading={enCours}
        onConfirm={(m) => void executer(m)}
        onClose={fermer}
      />
      <MotifDialog
        open={action === "annuler" && !!cible}
        titre="Annuler ce paiement"
        description={cible ? `Le paiement ${cible.reference} sera annulé.` : ""}
        confirmLabel="Annuler le paiement"
        loading={enCours}
        onConfirm={(m) => void executer(m)}
        onClose={fermer}
      />
    </div>
  );
}

export default AdminPaiementsPage;
