import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet } from "lucide-react";
import { attribuerSoldeClient } from "../../../services/clientService";
import { getApiError } from "../../../services/apiError";
import type { Client, TransactionFinanciere } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";
import { Textarea } from "../../../shared/ui/textarea";

const schema = z.object({
  montant: z
    .string()
    .trim()
    .min(1, "Le montant est requis.")
    .refine((value) => {
      const montant = Number(value.replace(",", "."));
      return Number.isFinite(montant) && montant > 0;
    }, "Le montant doit être supérieur à zéro.")
    .refine((value) => {
      const montant = value.replace(",", ".");
      return /^\d+(\.\d{1,2})?$/.test(montant);
    }, "Utilisez au maximum deux décimales."),
  commentaire: z.string().trim().max(500, "Le commentaire est trop long."),
});

type FormData = z.infer<typeof schema>;

export function SoldeAttributionModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: (transaction: TransactionFinanciere) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { montant: "", commentaire: "" },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      const transaction = await attribuerSoldeClient(client.id, {
        montant: data.montant.replace(",", "."),
        commentaire: data.commentaire.trim() || undefined,
      });
      onSaved(transaction);
      onClose();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.montant) setError("montant", { message: fields.montant });
      if (fields.commentaire) setError("commentaire", { message: fields.commentaire });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Attribuer le crédit initial"
      description={`${client.prenom} ${client.nom} · ${client.telephone}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Alert variant="info">
          Le crédit initial ne peut être attribué qu'une seule fois. Il est enregistré
          immédiatement dans le grand livre et sera visible dans l'espace client dès son
          activation.
        </Alert>

        {formError && <Alert variant="error">{formError}</Alert>}

        <div>
          <label htmlFor="solde-montant" className="block text-sm font-medium text-ink">
            Montant à attribuer
          </label>
          <Input
            id="solde-montant"
            inputMode="decimal"
            placeholder="Ex : 50000"
            className="mt-1"
            aria-invalid={!!errors.montant}
            aria-describedby={errors.montant ? "solde-montant-error" : undefined}
            {...register("montant")}
          />
          {errors.montant && (
            <p id="solde-montant-error" className="mt-1 text-xs text-red-600">
              {errors.montant.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="solde-commentaire" className="block text-sm font-medium text-ink">
            Commentaire <span className="font-normal text-muted">(optionnel)</span>
          </label>
          <Textarea
            id="solde-commentaire"
            placeholder="Référence, précision comptable..."
            className="mt-1 min-h-20"
            aria-invalid={!!errors.commentaire}
            aria-describedby={errors.commentaire ? "solde-commentaire-error" : undefined}
            {...register("commentaire")}
          />
          {errors.commentaire && (
            <p id="solde-commentaire-error" className="mt-1 text-xs text-red-600">
              {errors.commentaire.message}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand text-white hover:bg-brand-dark"
          >
            <Wallet className="h-4 w-4" />
            {isSubmitting ? "Attribution..." : "Attribuer le crédit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
