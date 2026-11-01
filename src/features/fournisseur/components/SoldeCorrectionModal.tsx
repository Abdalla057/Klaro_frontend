import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wallet } from "lucide-react";
import { regulariserClient } from "../../../services/financeService";
import { getApiError } from "../../../services/apiError";
import type { Client, TransactionFinanciere } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";
import { Textarea } from "../../../shared/ui/textarea";
import { formatMoney } from "../lib/format";

const schema = z.object({
  nouveau_solde: z
    .string()
    .trim()
    .min(1, "Le montant est requis.")
    .refine((value) => {
      const montant = value.replace(",", ".");
      return /^\d+(\.\d{1,2})?$/.test(montant);
    }, "Saisissez un montant valide avec au maximum deux décimales."),
  motif: z
    .string()
    .trim()
    .min(3, "Le motif de la correction est requis.")
    .max(500, "Le motif ne peut pas dépasser 500 caractères."),
});

type FormData = z.infer<typeof schema>;

export function SoldeCorrectionModal({
  client,
  devise,
  onClose,
  onSaved,
}: {
  client: Client;
  devise: string | null;
  onClose: () => void;
  onSaved: (transaction: TransactionFinanciere) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const soldeActuel = Number(client.solde_du);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nouveau_solde: client.solde_du,
      motif: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    const nouveauSolde = Number(data.nouveau_solde.replace(",", "."));
    const difference = Number((nouveauSolde - soldeActuel).toFixed(2));

    if (difference === 0) {
      setFormError("Le nouveau montant est identique au solde actuel.");
      return;
    }

    try {
      const transaction = await regulariserClient({
        client: client.id,
        montant: Math.abs(difference).toFixed(2),
        sens: difference > 0 ? "CREDIT" : "DEBIT",
        motif: data.motif.trim(),
      });
      onSaved(transaction);
      onClose();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.montant) {
        setError("nouveau_solde", { message: fields.montant });
      }
      if (fields.motif) setError("motif", { message: fields.motif });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Corriger le solde"
      description={`${client.prenom} ${client.nom} · ${client.telephone}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Alert variant="warning">
          La correction est enregistrée comme une régularisation dans le grand livre. Le
          solde du client sera ajusté immédiatement de la différence.
        </Alert>

        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <p className="text-muted">Solde dû actuel</p>
          <p className="mt-1 font-semibold text-ink">
            {formatMoney(client.solde_du, devise)}
          </p>
          <p className="mt-2 text-xs text-muted">
            Crédit initial enregistré : {formatMoney(client.montant_credit_initial, devise)}
          </p>
        </div>

        {formError && <Alert variant="error">{formError}</Alert>}

        <div>
          <label
            htmlFor="correction-montant"
            className="block text-sm font-medium text-ink"
          >
            Nouveau solde dû
          </label>
          <Input
            id="correction-montant"
            inputMode="decimal"
            placeholder="Ex : 50000"
            className="mt-1"
            aria-invalid={!!errors.nouveau_solde}
            aria-describedby={
              errors.nouveau_solde ? "correction-montant-error" : undefined
            }
            {...register("nouveau_solde")}
          />
          {errors.nouveau_solde && (
            <p id="correction-montant-error" className="mt-1 text-xs text-red-600">
              {errors.nouveau_solde.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="correction-motif" className="block text-sm font-medium text-ink">
            Motif de la correction
          </label>
          <Textarea
            id="correction-motif"
            placeholder="Ex : erreur de saisie lors de la création du client..."
            className="mt-1 min-h-20"
            aria-invalid={!!errors.motif}
            aria-describedby={errors.motif ? "correction-motif-error" : undefined}
            {...register("motif")}
          />
          {errors.motif && (
            <p id="correction-motif-error" className="mt-1 text-xs text-red-600">
              {errors.motif.message}
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
            {isSubmitting ? "Correction..." : "Corriger le solde"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
