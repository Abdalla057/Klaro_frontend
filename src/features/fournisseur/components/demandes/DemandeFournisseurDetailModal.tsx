import { useEffect, useState } from "react";
import { Ban, Download, Loader2, Upload } from "lucide-react";
import { Alert } from "../../../../shared/ui/alert";
import { Badge } from "../../../../shared/ui/badge";
import { Button } from "../../../../shared/ui/button/button";
import { Modal } from "../../../../shared/ui/modal";
import { getApiError } from "../../../../services/apiError";
import {
  getEvenementsDemandeFournisseur,
  telechargerPreuveFournisseur,
} from "../../../../services/abonnementDemandeService";
import type {
  DemandeAbonnement,
  EvenementDemande,
} from "../../../../types/demandesAbonnement";
import {
  demandeStatus,
  estDemandeActive,
  libelleMoyenPaiement,
} from "../../../../shared/utils/demandes";
import { formatDate, formatMoney } from "../../../../shared/utils/format";

export function DemandeFournisseurDetailModal({
  demande,
  loadingAction,
  onClose,
  onSoumettrePaiement,
  onAnnuler,
}: {
  demande: DemandeAbonnement | null;
  loadingAction: boolean;
  onClose: () => void;
  onSoumettrePaiement: (demande: DemandeAbonnement) => void;
  onAnnuler: (demande: DemandeAbonnement) => void;
}) {
  const [evenements, setEvenements] = useState<EvenementDemande[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [telechargement, setTelechargement] = useState(false);

  useEffect(() => {
    if (!demande) return;
    let annule = false;

    getEvenementsDemandeFournisseur(demande.id)
      .then((resultat) => {
        if (!annule) setEvenements(resultat.items);
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
      await telechargerPreuveFournisseur(demande.id, demande.reference);
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
      description="Suivez le traitement de votre demande et transmettez votre justificatif."
      size="lg"
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

          <dl className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Plan</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{demande.plan_nom}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Montant attendu</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {formatMoney(demande.montant, demande.devise)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Moyen de paiement</dt>
              <dd className="mt-1 text-sm text-ink">
                {libelleMoyenPaiement(demande.moyen_paiement, demande.moyen_paiement_display)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Référence transaction</dt>
              <dd className="mt-1 text-sm text-ink">{demande.reference_transaction || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Créée le</dt>
              <dd className="mt-1 text-sm text-ink">{formatDate(demande.date_creation, true)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">Expire le</dt>
              <dd className="mt-1 text-sm text-ink">{formatDate(demande.date_expiration, true)}</dd>
            </div>
          </dl>

          {demande.commentaire_fournisseur && (
            <div className="rounded-2xl bg-surface px-4 py-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Votre commentaire</p>
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
                    <p className="text-xs text-muted">{formatDate(evenement.date_creation, true)}</p>
                    {evenement.motif && <p className="mt-1 text-ink">{evenement.motif}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loadingAction}>
              Fermer
            </Button>
            {active && demande.est_annulable && (
              <Button type="button" variant="outline" onClick={() => onAnnuler(demande)} disabled={loadingAction}>
                <Ban className="h-4 w-4" aria-hidden="true" />
                Annuler
              </Button>
            )}
            {active && (
              <Button type="button" onClick={() => onSoumettrePaiement(demande)} disabled={loadingAction}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                {demande.preuve_paiement ? "Remplacer le justificatif" : "Transmettre le justificatif"}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
