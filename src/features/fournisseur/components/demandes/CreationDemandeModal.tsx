import { useState } from "react";
import { Loader2, Paperclip, ShieldCheck } from "lucide-react";
import { Alert } from "../../../../shared/ui/alert";
import { Button } from "../../../../shared/ui/button/button";
import { Input } from "../../../../shared/ui/input";
import { Modal } from "../../../../shared/ui/modal";
import { Select } from "../../../../shared/ui/select";
import { Textarea } from "../../../../shared/ui/textarea";
import type {
  DemandeAbonnementCreationPayload,
  DemandeTypeOperation,
} from "../../../../types/demandesAbonnement";
import type { MoyenPaiement, PlanAbonnement } from "../../../../types/superAdmin";
import { MOYENS_PAIEMENT_MANUELS } from "../../../../shared/utils/demandes";
import { formatMoney } from "../../../../shared/utils/format";

const TAILLE_MAX = 5 * 1024 * 1024;
const TYPES_ACCEPTES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function nouvelleCleIdempotence(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `demande-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function validerFichier(fichier: File): string | null {
  if (!TYPES_ACCEPTES.includes(fichier.type)) {
    return "Formats acceptés : PDF, JPG, PNG ou WEBP.";
  }
  if (fichier.size > TAILLE_MAX) {
    return "Le justificatif ne doit pas dépasser 5 Mo.";
  }
  return null;
}

export function CreationDemandeModal({
  plan,
  operation,
  abonnementCible,
  loading,
  onCreer,
  onClose,
}: {
  plan: PlanAbonnement | null;
  operation: DemandeTypeOperation;
  abonnementCible: number | null;
  loading: boolean;
  onCreer: (payload: DemandeAbonnementCreationPayload) => void;
  onClose: () => void;
}) {
  const [cle] = useState(nouvelleCleIdempotence);
  const [reference, setReference] = useState("");
  const [prestataire, setPrestataire] = useState("");
  const [moyen, setMoyen] = useState<MoyenPaiement | "">("");
  const [commentaire, setCommentaire] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const choisirFichier = (selection: File | null) => {
    if (selection) {
      const message = validerFichier(selection);
      if (message) {
        setErreur(message);
        setFichier(null);
        return;
      }
    }
    setErreur(null);
    setFichier(selection);
  };

  const envoyer = () => {
    if (!plan || !cle) return;
    if (!reference.trim() && !fichier) {
      setErreur("Renseignez une référence de transaction ou joignez un justificatif.");
      return;
    }
    setErreur(null);
    onCreer({
      plan: plan.id,
      type_operation: operation,
      abonnement_cible: operation === "RENOUVELLEMENT" ? abonnementCible : null,
      moyen_paiement: moyen,
      prestataire: prestataire.trim(),
      reference_transaction: reference.trim(),
      preuve_paiement: fichier,
      cle_idempotence: cle,
      commentaire_fournisseur: commentaire.trim(),
    });
  };

  return (
    <Modal
      open={Boolean(plan)}
      onClose={onClose}
      title={operation === "RENOUVELLEMENT" ? "Renouveler l'abonnement" : "Souscrire à un plan"}
      description="Le montant est figé par le serveur. Votre demande sera traitée après vérification du paiement par KLARO."
      size="lg"
    >
      {plan && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">{plan.nom}</p>
                <p className="text-xs text-muted">
                  {plan.duree_jours} jours —{" "}
                  {plan.max_clients === null ? "clients illimités" : `${plan.max_clients} clients`} —{" "}
                  {plan.max_agents === null ? "agents illimités" : `${plan.max_agents} agents`}
                </p>
              </div>
              <p className="font-semibold text-ink">
                {formatMoney(
                  plan.prix_local ?? plan.prix,
                  plan.prix_local ? plan.devise_locale : plan.devise,
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <p className="text-sm text-muted">
              Aucun paiement n'est confirmé depuis cette page. KLARO vérifie le justificatif puis
              active ou prolonge l'abonnement.
            </p>
          </div>

          {erreur && <Alert variant="error">{erreur}</Alert>}

          <label className="block text-sm font-medium text-ink">
            Référence de transaction
            <Input
              className="mt-1.5"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Identifiant du paiement"
              maxLength={150}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Moyen de paiement
              <Select
                className="mt-1.5"
                value={moyen}
                onChange={(e) => setMoyen(e.target.value as MoyenPaiement | "")}
              >
                <option value="">Non précisé</option>
                {MOYENS_PAIEMENT_MANUELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm font-medium text-ink">
              Opérateur / prestataire
              <Input
                className="mt-1.5"
                value={prestataire}
                onChange={(e) => setPrestataire(e.target.value)}
                placeholder="Nom de l'opérateur"
                maxLength={50}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-ink">
            Justificatif
            <span className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-white px-4 py-3 text-sm text-muted transition-colors hover:border-pine/40 hover:text-ink">
              <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {fichier ? fichier.name : "PDF, JPG, PNG ou WEBP — 5 Mo maximum"}
              </span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => choisirFichier(e.target.files?.[0] ?? null)}
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-ink">
            Commentaire
            <Textarea
              className="mt-1.5"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Précisions à destination de KLARO"
            />
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="button" onClick={envoyer} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? "Envoi..." : "Créer la demande"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
