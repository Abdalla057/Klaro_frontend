import { useEffect, useState, type ReactNode } from "react";
import { Ban, CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import { Alert } from "../../../../shared/ui/alert";
import { Badge } from "../../../../shared/ui/badge";
import { Button } from "../../../../shared/ui/button/button";
import { Modal } from "../../../../shared/ui/modal";
import { getApiError } from "../../../../services/apiError";
import {
  getEvenementsDemandeAdmin,
  getPaiementsDemandeAdmin,
  telechargerPreuveAdmin,
} from "../../../../services/abonnementDemandeService";
import type {
  DemandeAbonnement,
  EvenementDemande,
} from "../../../../types/demandesAbonnement";
import type { PaiementAbonnement } from "../../../../types/superAdmin";
import {
  demandeStatus,
  estDemandeActive,
  libelleMoyenPaiement,
} from "../../../../shared/utils/demandes";
import { formatDate, formatMoney } from "../../../../shared/utils/format";
import { paiementStatus } from "../../lib/status";

function Ligne({ label, valeur }: { label: string; valeur: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{valeur || "—"}</dd>
    </div>
  );
}

export function DemandeDetailModal({
  demande,
  loadingAction,
  onClose,
  onConfirmer,
  onRefuser,
  onAnnuler,
}: {
  demande: DemandeAbonnement | null;
  loadingAction: boolean;
  onClose: () => void;
  onConfirmer: (demande: DemandeAbonnement) => void;
  onRefuser: (demande: DemandeAbonnement) => void;
  onAnnuler: (demande: DemandeAbonnement) => void;
}) {
  const [paiements, setPaiements] = useState<PaiementAbonnement[]>([]);
  const [evenements, setEvenements] = useState<EvenementDemande[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [telechargement, setTelechargement] = useState(false);

  useEffect(() => {
    if (!demande) return;
    let annule = false;

    Promise.all([
      getPaiementsDemandeAdmin(demande.id),
      getEvenementsDemandeAdmin(demande.id),
    ])
      .then(([listePaiements, listeEvenements]) => {
        if (annule) return;
        setPaiements(listePaiements.items);
        setEvenements(listeEvenements.items);
      })
      .catch((e: unknown) => {
        if (!annule) setErreur(getApiError(e).message);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [demande]);

  const telecharger = async () => {
    if (!demande) return;
    setTelechargement(true);
    setErreur(null);
    try {
      await telechargerPreuveAdmin(demande.id, demande.reference);
    } catch (e) {
      setErreur(getApiError(e).message);
    } finally {
      setTelechargement(false);
    }
  };

  const config = demande ? demandeStatus(demande.statut) : null;
  const active = demande ? estDemandeActive(demande.statut) : false;

  return (
    <Modal
      open={Boolean(demande)}
      onClose={onClose}
      title={demande ? `Demande ${demande.reference}` : "Demande"}
      description="Détail, justificatif, paiements et historique de traitement."
      size="xl"
    >
      {demande && config && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={config.tone}>{demande.statut_display}</Badge>
            <Badge tone="neutral">{demande.type_operation_display}</Badge>
            {demande.preuve_paiement && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void telecharger()}
                disabled={telechargement}
              >
                {telechargement ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Justificatif
              </Button>
            )}
          </div>

          {erreur && <Alert variant="error">{erreur}</Alert>}

          <dl className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Ligne label="Fournisseur" valeur={demande.fournisseur.nom_entreprise} />
            <Ligne label="Code fournisseur" valeur={demande.fournisseur.code_entreprise} />
            <Ligne label="Téléphone" valeur={demande.fournisseur.telephone} />
            <Ligne label="Plan" valeur={demande.plan_nom} />
            <Ligne
              label="Montant attendu"
              valeur={<span className="font-semibold">{formatMoney(demande.montant, demande.devise)}</span>}
            />
            <Ligne label="Moyen de paiement" valeur={libelleMoyenPaiement(demande.moyen_paiement, demande.moyen_paiement_display)} />
            <Ligne label="Référence transaction" valeur={demande.reference_transaction} />
            <Ligne label="Prestataire" valeur={demande.prestataire} />
            <Ligne label="Créée le" valeur={formatDate(demande.date_creation, true)} />
            <Ligne label="Expire le" valeur={formatDate(demande.date_expiration, true)} />
            <Ligne label="Traitée le" valeur={formatDate(demande.date_traitement, true)} />
            <Ligne
              label="Traitée par"
              valeur={demande.traite_par ? demande.traite_par.telephone : null}
            />
          </dl>

          {demande.commentaire_fournisseur && (
            <div className="rounded-2xl bg-surface px-4 py-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Commentaire du fournisseur
              </p>
              <p className="mt-1 whitespace-pre-wrap text-ink">{demande.commentaire_fournisseur}</p>
            </div>
          )}

          {demande.motif_traitement && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="text-xs font-medium uppercase tracking-wide">Motif de traitement</p>
              <p className="mt-1 whitespace-pre-wrap">{demande.motif_traitement}</p>
            </div>
          )}

          <section>
            <h3 className="text-sm font-semibold text-ink">Paiements liés</h3>
            {chargement ? (
              <p className="mt-2 text-sm text-muted">Chargement…</p>
            ) : paiements.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucun paiement enregistré pour cette demande.</p>
            ) : (
              <div className="mt-2 divide-y divide-border rounded-2xl border border-border">
                {paiements.map((paiement) => {
                  const statut = paiementStatus(paiement.statut);
                  return (
                    <div key={paiement.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-ink">{paiement.reference}</p>
                        <p className="text-xs text-muted">
                          {formatDate(paiement.date_creation, true)} — {paiement.moyen_paiement_display || "Moyen non précisé"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-ink">
                          {formatMoney(paiement.montant, paiement.devise)}
                        </span>
                        <Badge tone={statut.tone}>{statut.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-ink">Historique</h3>
            {chargement ? (
              <p className="mt-2 text-sm text-muted">Chargement…</p>
            ) : evenements.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucun événement enregistré.</p>
            ) : (
              <ol className="mt-3 space-y-3 border-l border-border pl-4">
                {evenements.map((evenement) => (
                  <li key={evenement.id} className="relative text-sm">
                    <span className="absolute -left-[1.32rem] top-1.5 h-2 w-2 rounded-full bg-pine" aria-hidden="true" />
                    <p className="font-medium text-ink">{evenement.type_evenement_display}</p>
                    <p className="text-xs text-muted">
                      {formatDate(evenement.date_creation, true)}
                      {evenement.effectue_par ? ` — ${evenement.effectue_par.telephone}` : ""}
                    </p>
                    {evenement.motif && <p className="mt-1 text-ink">{evenement.motif}</p>}
                    {evenement.montant && (
                      <p className="mt-1 text-xs text-muted">
                        Montant : {formatMoney(evenement.montant, demande.devise)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {active && (
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={loadingAction}>
                Fermer
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => onAnnuler(demande)}
                disabled={loadingAction}
              >
                <Ban className="h-4 w-4" aria-hidden="true" />
                Annuler la demande
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onRefuser(demande)}
                disabled={loadingAction}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Refuser
              </Button>
              <Button type="button" onClick={() => onConfirmer(demande)} disabled={loadingAction}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Confirmer
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
