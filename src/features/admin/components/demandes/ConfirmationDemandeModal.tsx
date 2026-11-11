import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../../../../shared/ui/button/button";
import { Input } from "../../../../shared/ui/input";
import { Modal } from "../../../../shared/ui/modal";
import { Select } from "../../../../shared/ui/select";
import { Textarea } from "../../../../shared/ui/textarea";
import type { ConfirmationDemandePayload } from "../../../../types/demandesAbonnement";
import type { DemandeAbonnement } from "../../../../types/demandesAbonnement";
import type { MoyenPaiement } from "../../../../types/superAdmin";
import { MOYENS_PAIEMENT_MANUELS } from "../../../../shared/utils/demandes";
import { formatMoney } from "../../../../shared/utils/format";

const VIDE = {
  reference_transaction: "",
  prestataire: "",
  provider_transaction_id: "",
  moyen_paiement: "" as MoyenPaiement | "",
  motif: "",
};

export function ConfirmationDemandeModal({
  demande,
  loading,
  onConfirm,
  onClose,
}: {
  demande: DemandeAbonnement | null;
  loading: boolean;
  onConfirm: (payload: ConfirmationDemandePayload) => void;
  onClose: () => void;
}) {
  const [valeurs, setValeurs] = useState(() =>
    demande
      ? {
          ...VIDE,
          reference_transaction: demande.reference_transaction,
          prestataire: demande.prestataire,
          moyen_paiement: demande.moyen_paiement,
        }
      : VIDE,
  );

  const modifier = <K extends keyof typeof VIDE>(cle: K, valeur: (typeof VIDE)[K]) => {
    setValeurs((courant) => ({ ...courant, [cle]: valeur }));
  };

  return (
    <Modal
      open={Boolean(demande)}
      onClose={onClose}
      title="Confirmer la demande"
      description="La confirmation active ou prolonge l'abonnement. Vérifiez le paiement avant de valider définitivement."
      size="lg"
    >
      {demande && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-ink">{demande.reference}</span>
              <span className="font-semibold text-ink">
                {formatMoney(demande.montant, demande.devise)}
              </span>
            </div>
            <p className="mt-1 text-muted">
              {demande.fournisseur.nom_entreprise} — {demande.plan_nom} ({demande.type_operation_display})
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Référence de transaction
              <Input
                className="mt-1.5"
                value={valeurs.reference_transaction}
                onChange={(e) => modifier("reference_transaction", e.target.value)}
                placeholder="Référence confirmée"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Prestataire
              <Input
                className="mt-1.5"
                value={valeurs.prestataire}
                onChange={(e) => modifier("prestataire", e.target.value)}
                placeholder="wave, orange_money…"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Identifiant prestataire
              <Input
                className="mt-1.5"
                value={valeurs.provider_transaction_id}
                onChange={(e) => modifier("provider_transaction_id", e.target.value)}
                placeholder="Identifiant côté prestataire"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Moyen de paiement
              <Select
                className="mt-1.5"
                value={valeurs.moyen_paiement}
                onChange={(e) => modifier("moyen_paiement", e.target.value as MoyenPaiement | "")}
              >
                <option value="">Non précisé</option>
                {MOYENS_PAIEMENT_MANUELS.map((moyen) => (
                  <option key={moyen.value} value={moyen.value}>
                    {moyen.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Note de traitement
            <Textarea
              className="mt-1.5"
              value={valeurs.motif}
              onChange={(e) => modifier("motif", e.target.value)}
              placeholder="Contrôle effectué, informations complémentaires…"
            />
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Retour
            </Button>
            <Button type="button" onClick={() => onConfirm(valeurs)} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? "Confirmation..." : "Confirmer la demande"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
