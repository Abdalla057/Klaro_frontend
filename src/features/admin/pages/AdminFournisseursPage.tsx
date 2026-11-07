import { useMemo, useState } from "react";
import { PauseCircle, PlayCircle, RefreshCw } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { ErrorState } from "../../../shared/ui/error-state";
import { Skeleton } from "../../../shared/ui/loading";
import { getApiError } from "../../../services/apiError";
import { reactiverFournisseur, suspendreFournisseur } from "../../../services/superAdminService";
import { formatDate } from "../../../shared/utils/format";
import type { FournisseurSupervision } from "../../../types/superAdmin";
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
import { statutAbonnement } from "../lib/dashboard";
import { abonnementStatus } from "../lib/status";
import { useParametresListe } from "../lib/useParametresListe";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function AdminFournisseursPage() {
  const { fournisseurs, loading, error, refresh } = useAdminData();
  const { valeur, definir, signature } = useParametresListe(["q", "statut", "filtre"]);
  const [cible, setCible] = useState<FournisseurSupervision | null>(null);
  const [mode, setMode] = useState<"suspendre" | "reactiver" | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; texte: string } | null>(null);

  const q = norm(valeur("q"));
  const statut = valeur("statut");
  const attention = valeur("filtre") === "attention";

  const lignes = useMemo(
    () =>
      fournisseurs.filter((f) => {
        if (statut && f.statut !== statut) return false;
        if (attention && !(f.est_suspendu || !f.abonnement || !f.abonnement.est_actif)) return false;
        if (!q) return true;
        return [f.nom_entreprise, f.code_entreprise, f.telephone].some((c) => norm(c).includes(q));
      }),
    [fournisseurs, q, statut, attention],
  );

  const fermer = () => {
    setCible(null);
    setMode(null);
  };

  const executer = async (motif?: string) => {
    if (!cible || !mode) return;
    setEnCours(true);
    try {
      if (mode === "suspendre") await suspendreFournisseur(cible.id, motif ?? "");
      else await reactiverFournisseur(cible.id);
      setMessage({
        type: "success",
        texte: `${cible.nom_entreprise} a été ${mode === "suspendre" ? "suspendu" : "réactivé"}.`,
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

  if (loading && fournisseurs.length === 0) return <Skeleton className="h-96 rounded-[1.75rem]" />;
  if (error && fournisseurs.length === 0) return <ErrorState message={error} onRetry={() => void refresh(false)} />;

  return (
    <div className="space-y-4">
      <ListPageHeader
        titre="Fournisseurs"
        description="Suivi des fournisseurs, de leur abonnement et de leur activité. Suspendez ou réactivez un compte si nécessaire."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh(true)}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {message && (
        <Alert variant={message.type}>{message.texte}</Alert>
      )}

      <Toolbar
        recherche={valeur("q")}
        onRecherche={(v) => definir({ q: v })}
        placeholder="Rechercher par nom, code ou téléphone"
      >
        <FiltreSelect
          label="Filtrer par statut"
          value={attention ? "attention" : statut}
          onChange={(v) => {
            definir({ filtre: v === "attention" ? "attention" : "", statut: v === "attention" ? "" : v });
          }}
          options={[
            { value: "", label: "Tous les fournisseurs" },
            { value: "ACTIF", label: "Actifs" },
            { value: "SUSPENDU", label: "Suspendus" },
            { value: "attention", label: "À surveiller" },
          ]}
        />
      </Toolbar>

      <DataPanel
        lignes={lignes}
        libelle="fournisseur(s)"
        resetKey={signature}
        cle={(f) => f.id}
        entetes={["Entreprise", "Clients / agents", "Abonnement", "Statut", ""]}
        vide="Aucun fournisseur ne correspond à ces critères."
        rendu={(f) => {
          const ab = f.abonnement;
          const config = ab ? abonnementStatus(statutAbonnement(ab)) : null;
          return (
            <>
              <Cell>
                <p className="font-semibold text-ink">{f.nom_entreprise}</p>
                <p className="text-xs text-muted">
                  {f.code_entreprise} · {f.telephone}
                </p>
              </Cell>
              <Cell className="text-muted">
                {f.nombre_clients} client(s) · {f.nombre_agents} agent(s)
              </Cell>
              <Cell>
                {ab && config ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink">{ab.plan_nom}</span>
                      <Badge tone={config.tone}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted">Expire le {formatDate(ab.date_fin)}</p>
                  </div>
                ) : (
                  <span className="text-muted">Aucun abonnement</span>
                )}
              </Cell>
              <Cell>
                <Badge tone={f.est_suspendu ? "danger" : "success"}>{f.est_suspendu ? "Suspendu" : "Actif"}</Badge>
              </Cell>
              <Cell>
                <div className="flex justify-end">
                  {f.est_suspendu ? (
                    <ActionBouton
                      label={`Réactiver ${f.nom_entreprise}`}
                      tone="success"
                      onClick={() => {
                        setCible(f);
                        setMode("reactiver");
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </ActionBouton>
                  ) : (
                    <ActionBouton
                      label={`Suspendre ${f.nom_entreprise}`}
                      tone="danger"
                      onClick={() => {
                        setCible(f);
                        setMode("suspendre");
                      }}
                    >
                      <PauseCircle className="h-4 w-4" />
                    </ActionBouton>
                  )}
                </div>
              </Cell>
            </>
          );
        }}
      />

      <MotifDialog
        open={mode === "suspendre" && !!cible}
        titre="Suspendre ce fournisseur"
        description={cible ? `${cible.nom_entreprise} ne pourra plus utiliser la plateforme tant qu'il est suspendu.` : ""}
        confirmLabel="Suspendre"
        loading={enCours}
        onConfirm={(motif) => void executer(motif)}
        onClose={fermer}
      />
      <ConfirmDialog
        open={mode === "reactiver" && !!cible}
        title="Réactiver ce fournisseur"
        description={cible ? `${cible.nom_entreprise} retrouvera l'accès à la plateforme.` : ""}
        confirmLabel="Réactiver"
        tone="default"
        loading={enCours}
        onConfirm={() => void executer()}
        onClose={fermer}
      />
    </div>
  );
}

export default AdminFournisseursPage;
