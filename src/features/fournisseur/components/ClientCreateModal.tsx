import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { createClient } from "../../../services/clientService";
import { getApiError } from "../../../services/apiError";
import type { Client } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";
import { Textarea } from "../../../shared/ui/textarea";

const schema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(150, "Le nom ne peut pas dépasser 150 caractères."),
  prenom: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(150, "Le prénom ne peut pas dépasser 150 caractères."),
  telephone: z
    .string()
    .trim()
    .min(8, "Le numéro doit contenir au moins 8 caractères.")
    .max(20, "Le numéro ne peut pas dépasser 20 caractères.")
    .regex(/^[0-9+\s().-]+$/, "Numéro de téléphone invalide."),
  adresse: z
    .string()
    .trim()
    .min(1, "L'adresse est requise.")
    .max(255, "L'adresse ne peut pas dépasser 255 caractères."),
  solde_initial: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const montant = value.replace(",", ".");
      return /^\d+(\.\d{1,2})?$/.test(montant) && Number(montant) > 0;
    }, "Saisissez un montant valide supérieur à zéro, avec au maximum deux décimales."),
});

type FormData = z.infer<typeof schema>;

export function ClientCreateModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (client: Client) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "",
      adresse: "",
      solde_initial: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      const soldeInitial = data.solde_initial.trim().replace(",", ".");
      const client = await createClient({
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        telephone: data.telephone.trim(),
        adresse: data.adresse.trim(),
        solde_initial: soldeInitial || undefined,
      });
      onSaved(client);
      onClose();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.nom) setError("nom", { message: fields.nom });
      if (fields.prenom) setError("prenom", { message: fields.prenom });
      if (fields.telephone) setError("telephone", { message: fields.telephone });
      if (fields.adresse) setError("adresse", { message: fields.adresse });
      if (fields.solde_initial) {
        setError("solde_initial", { message: fields.solde_initial });
      }
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Ajouter un client"
      description="Un code d'activation sera généré et devra être communiqué manuellement au client."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="client-nom" className="block text-sm font-medium text-ink">
              Nom
            </label>
            <Input
              id="client-nom"
              autoComplete="family-name"
              placeholder="Ex : Diallo"
              className="mt-1"
              aria-invalid={!!errors.nom}
              aria-describedby={errors.nom ? "client-nom-error" : undefined}
              {...register("nom")}
            />
            {errors.nom && (
              <p id="client-nom-error" className="mt-1 text-xs text-red-600">
                {errors.nom.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="client-prenom" className="block text-sm font-medium text-ink">
              Prénom
            </label>
            <Input
              id="client-prenom"
              autoComplete="given-name"
              placeholder="Ex : Aminata"
              className="mt-1"
              aria-invalid={!!errors.prenom}
              aria-describedby={errors.prenom ? "client-prenom-error" : undefined}
              {...register("prenom")}
            />
            {errors.prenom && (
              <p id="client-prenom-error" className="mt-1 text-xs text-red-600">
                {errors.prenom.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="client-telephone" className="block text-sm font-medium text-ink">
            Numéro de téléphone
          </label>
          <Input
            id="client-telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex : 0600000000"
            className="mt-1"
            aria-invalid={!!errors.telephone}
            aria-describedby={errors.telephone ? "client-telephone-error" : undefined}
            {...register("telephone")}
          />
          {errors.telephone && (
            <p id="client-telephone-error" className="mt-1 text-xs text-red-600">
              {errors.telephone.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="client-adresse" className="block text-sm font-medium text-ink">
            Adresse
          </label>
          <Textarea
            id="client-adresse"
            placeholder="Quartier, ville..."
            className="mt-1 min-h-20"
            aria-invalid={!!errors.adresse}
            aria-describedby={errors.adresse ? "client-adresse-error" : undefined}
            {...register("adresse")}
          />
          {errors.adresse && (
            <p id="client-adresse-error" className="mt-1 text-xs text-red-600">
              {errors.adresse.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="client-solde-initial" className="block text-sm font-medium text-ink">
            Crédit initial{" "}
            <span className="font-normal text-muted">(optionnel)</span>
          </label>
          <Input
            id="client-solde-initial"
            inputMode="decimal"
            placeholder="Ex : 50000"
            className="mt-1"
            aria-invalid={!!errors.solde_initial}
            aria-describedby={
              errors.solde_initial
                ? "client-solde-initial-error"
                : "client-solde-initial-help"
            }
            {...register("solde_initial")}
          />
          <p id="client-solde-initial-help" className="mt-1 text-xs text-muted">
            Le montant est enregistré immédiatement dans le grand livre et sera visible
            dans l'espace client dès son activation. Il pourra être corrigé ensuite.
          </p>
          {errors.solde_initial && (
            <p id="client-solde-initial-error" className="mt-1 text-xs text-red-600">
              {errors.solde_initial.message}
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
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Ajout..." : "Ajouter le client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
