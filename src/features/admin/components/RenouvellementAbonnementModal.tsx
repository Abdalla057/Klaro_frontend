import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";
import { Select } from "../../../shared/ui/select";
import { Textarea } from "../../../shared/ui/textarea";
import { MOYENS_PAIEMENT_MANUELS } from "../../../shared/utils/demandes";
import { formatDate, formatMoney } from "../../../shared/utils/format";
import type {
  AbonnementAdmin,
  MoyenPaiement,
  RenouvellementPayload,
} from "../../../types/superAdmin";

type Valeurs = {
  reference_paiement: string;
  montant_paiement: string;
  moyen_paiement: MoyenPaiement | "";
  notes: string;
};

const VIDE: Valeurs = {
  reference_paiement: "",
  montant_paiement: "",
  moyen_paiement: "",
  notes: "",
};

export function RenouvellementAbonnementModal({
  abonnement,
  loading,
  onConfirm,
  onClose,
}: {
  abonnement: AbonnementAdmin | null;
  loading: boolean;
  onConfirm: (payload: RenouvellementPayload) => void;
  onClose: () => void;
}) {
  const payant = abonnement ? Number(abonnement.plan.prix) > 0 : false;
  const [valeurs, setValeurs] = useState<Valeurs>(() =>
    abonnement
      ? {
          reference_paiement: abonnement.reference_paiement ?? "",
          montant_paiement: abonnement.plan.prix ?? "",
          moyen_paiement: "",
          notes: "",
        }
      : VIDE,
  );
  const [erreur, setErreur] = useState<string | null>(null);

  const modifier = <K extends keyof Valeurs>(cle: K, valeur: Valeurs[K]) => {
    setValeurs((courant) => ({ ...courant, [cle]: valeur }));
  };

  const envoyer = () => {
    if (!abonnement) return;
    const reference = valeurs.reference_paiement.trim();
    const montant = valeurs.montant_paiement.trim();
    if (payant) {
      if (!reference) {
        setErreur("Renseignez la référence du paiement confirmé.");
        return;
      }
      if (!montant || Number(montant) <= 0) {
        setErreur("Le montant du paiement doit être supérieur à zéro.");
        return;
      }
    }
    setErreur(null);
    onConfirm({
      paiement_confirme: payant,
      reference_paiement: reference,
      montant_paiement: payant ? montant : undefined,
      moyen_paiement: valeurs.moyen_paiement,
      notes: valeurs.notes.trim(),
    });
  };

  return (
    <Modal
      open={Boolean(abonnement)}
      onClose={onClose}
      title="Renouveler l'abonnement"
      description="Le renouvellement est possible uniquement après confirmation du paiement. Le paiement est enregistré et comptabilisé immédiatement."
      size="lg"
    >
      {abonnement && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-ink">
                {abonnement.fournisseur.nom_entreprise}
              </span>
              <span className="font-semibold text-ink">
                {formatMoney(abonnement.plan.prix, abonnement.plan.devise)}
              </span>
            </div>
            <p className="mt-1 text-muted">
              {abonnement.plan.nom} · fin le {formatDate(abonnement.date_fin)}
            </p>
          </div>

          {erreur && <Alert variant="error">{erreur}</Alert>}

          {payant ? (
            <>
              <Alert variant="info">
                Saisissez la référence du paiement déjà encaissé. Aucun appel à
                un opérateur de paiement n'est effectué.
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink">
                  Référence du paiement
                  <Input
                    className="mt-1.5"
                    value={valeurs.reference_paiement}
                    onChange={(e) =>
                      modifier("reference_paiement", e.target.value)
                    }
                    placeholder="Référence ou identifiant du paiement"
                    maxLength={100}
                  />
                </label>
                <label className="block text-sm font-medium text-ink">
                  Montant encaissé
                  <Input
                    className="mt-1.5"
                    type="number"
                    min="0"
                    step="0.01"
                    value={valeurs.montant_paiement}
                    onChange={(e) =>
                      modifier("montant_paiement", e.target.value)
                    }
                  />
                </label>
                <label className="block text-sm font-medium text-ink">
                  Moyen de paiement
                  <Select
                    className="mt-1.5"
                    value={valeurs.moyen_paiement}
                    onChange={(e) =>
                      modifier(
                        "moyen_paiement",
                        e.target.value as MoyenPaiement | "",
                      )
                    }
                  >
                    <option value="">Non précisé</option>
                    {MOYENS_PAIEMENT_MANUELS.map((moyen) => (
                      <option key={moyen.value} value={moyen.value}>
                        {moyen.label}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="block text-sm font-medium text-ink">
                  Note
                  <Textarea
                    className="mt-1.5"
                    value={valeurs.notes}
                    onChange={(e) => modifier("notes", e.target.value)}
                    placeholder="Informations complémentaires sur le paiement"
                  />
                </label>
              </div>
            </>
          ) : (
            <Alert variant="info">
              Ce plan est gratuit : aucun paiement n'est nécessaire pour le
              renouveler.
            </Alert>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="button" onClick={envoyer} disabled={loading}>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {loading ? "Renouvellement..." : "Renouveler"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
