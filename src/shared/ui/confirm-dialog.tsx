import { Loader2 } from "lucide-react";
import { Button } from "./button/button";
import { Modal } from "./modal";

/**
 * ConfirmDialog
 *
 * Confirmation d'une action sensible (suppression, validation, réactivation).
 * Le bouton de confirmation affiche un état de chargement explicite pour
 * empêcher les doubles soumissions.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
  tone = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={tone === "danger" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? "Traitement..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
