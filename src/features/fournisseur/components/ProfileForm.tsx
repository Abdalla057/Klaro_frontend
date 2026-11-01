import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { updateMonProfil } from "../../../services/fournisseurService";
import { getApiError } from "../../../services/apiError";
import type { Fournisseur } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Textarea } from "../../../shared/ui/textarea";

const schema = z.object({
  nom_entreprise: z
    .string()
    .trim()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères.")
    .max(255, "Le nom de l'entreprise ne peut pas dépasser 255 caractères."),
  adresse: z.string().trim().max(255, "L'adresse ne peut pas dépasser 255 caractères."),
});

type FormData = z.infer<typeof schema>;

export function ProfileForm({
  profil,
  onSaved,
}: {
  profil: Fournisseur;
  onSaved: (profil: Fournisseur) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom_entreprise: profil.nom_entreprise,
      adresse: profil.adresse ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      const updated = await updateMonProfil(profil.id, {
        nom_entreprise: data.nom_entreprise.trim(),
        adresse: data.adresse.trim(),
      });
      reset({
        nom_entreprise: updated.nom_entreprise,
        adresse: updated.adresse ?? "",
      });
      onSaved(updated);
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.nom_entreprise) {
        setError("nom_entreprise", { message: fields.nom_entreprise });
      }
      if (fields.adresse) setError("adresse", { message: fields.adresse });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      <div>
        <label htmlFor="profil-nom" className="block text-sm font-medium text-ink">
          Nom de l'entreprise
        </label>
        <Input
          id="profil-nom"
          className="mt-1"
          aria-invalid={!!errors.nom_entreprise}
          aria-describedby={errors.nom_entreprise ? "profil-nom-error" : undefined}
          {...register("nom_entreprise")}
        />
        {errors.nom_entreprise && (
          <p id="profil-nom-error" className="mt-1 text-xs text-red-600">
            {errors.nom_entreprise.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="profil-adresse" className="block text-sm font-medium text-ink">
          Adresse
        </label>
        <Textarea
          id="profil-adresse"
          placeholder="Quartier, ville..."
          className="mt-1 min-h-20"
          aria-invalid={!!errors.adresse}
          aria-describedby={errors.adresse ? "profil-adresse-error" : undefined}
          {...register("adresse")}
        />
        {errors.adresse && (
          <p id="profil-adresse-error" className="mt-1 text-xs text-red-600">
            {errors.adresse.message}
          </p>
        )}
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-brand text-white hover:bg-brand-dark"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
