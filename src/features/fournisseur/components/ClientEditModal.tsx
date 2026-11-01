import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { updateClient } from "../../../services/clientService";
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
  adresse: z
    .string()
    .trim()
    .min(1, "L'adresse est requise.")
    .max(255, "L'adresse ne peut pas dépasser 255 caractères."),
});

type FormData = z.infer<typeof schema>;

export function ClientEditModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
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
      nom: client.nom ?? "",
      prenom: client.prenom ?? "",
      adresse: client.adresse ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      const updated = await updateClient(client.id, {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        adresse: data.adresse.trim(),
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.nom) setError("nom", { message: fields.nom });
      if (fields.prenom) setError("prenom", { message: fields.prenom });
      if (fields.adresse) setError("adresse", { message: fields.adresse });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Modifier le client"
      description="Le numéro de téléphone ne peut pas être modifié."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="client-edit-nom" className="block text-sm font-medium text-ink">
              Nom
            </label>
            <Input
              id="client-edit-nom"
              autoComplete="family-name"
              className="mt-1"
              aria-invalid={!!errors.nom}
              aria-describedby={errors.nom ? "client-edit-nom-error" : undefined}
              {...register("nom")}
            />
            {errors.nom && (
              <p id="client-edit-nom-error" className="mt-1 text-xs text-red-600">
                {errors.nom.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="client-edit-prenom" className="block text-sm font-medium text-ink">
              Prénom
            </label>
            <Input
              id="client-edit-prenom"
              autoComplete="given-name"
              className="mt-1"
              aria-invalid={!!errors.prenom}
              aria-describedby={errors.prenom ? "client-edit-prenom-error" : undefined}
              {...register("prenom")}
            />
            {errors.prenom && (
              <p id="client-edit-prenom-error" className="mt-1 text-xs text-red-600">
                {errors.prenom.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="client-edit-telephone" className="block text-sm font-medium text-ink">
            Numéro de téléphone
          </label>
          <Input
            id="client-edit-telephone"
            type="tel"
            value={client.telephone}
            disabled
            className="mt-1 bg-surface"
          />
        </div>

        <div>
          <label htmlFor="client-edit-adresse" className="block text-sm font-medium text-ink">
            Adresse
          </label>
          <Textarea
            id="client-edit-adresse"
            placeholder="Quartier, ville..."
            className="mt-1 min-h-20"
            aria-invalid={!!errors.adresse}
            aria-describedby={errors.adresse ? "client-edit-adresse-error" : undefined}
            {...register("adresse")}
          />
          {errors.adresse && (
            <p id="client-edit-adresse-error" className="mt-1 text-xs text-red-600">
              {errors.adresse.message}
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
            <Save className="h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
