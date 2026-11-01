import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { changePassword } from "../../../services/compteService";
import { getApiError } from "../../../services/apiError";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";

const schema = z
  .object({
    ancien_mot_de_passe: z.string().min(1, "L'ancien mot de passe est requis."),
    nouveau_mot_de_passe: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
    confirmation: z.string().min(1, "La confirmation est requise."),
  })
  .refine((data) => data.nouveau_mot_de_passe === data.confirmation, {
    path: ["confirmation"],
    message: "Les mots de passe ne correspondent pas.",
  });

type FormData = z.infer<typeof schema>;

export function PasswordForm({ onChanged }: { onChanged: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ancien_mot_de_passe: "",
      nouveau_mot_de_passe: "",
      confirmation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      await changePassword(data);
      onChanged();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.ancien_mot_de_passe) {
        setError("ancien_mot_de_passe", { message: fields.ancien_mot_de_passe });
      }
      if (fields.nouveau_mot_de_passe) {
        setError("nouveau_mot_de_passe", { message: fields.nouveau_mot_de_passe });
      }
      if (fields.confirmation) {
        setError("confirmation", { message: fields.confirmation });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      <div>
        <label htmlFor="password-ancien" className="block text-sm font-medium text-ink">
          Ancien mot de passe
        </label>
        <Input
          id="password-ancien"
          type="password"
          autoComplete="current-password"
          className="mt-1"
          aria-invalid={!!errors.ancien_mot_de_passe}
          aria-describedby={errors.ancien_mot_de_passe ? "password-ancien-error" : undefined}
          {...register("ancien_mot_de_passe")}
        />
        {errors.ancien_mot_de_passe && (
          <p id="password-ancien-error" className="mt-1 text-xs text-red-600">
            {errors.ancien_mot_de_passe.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password-nouveau" className="block text-sm font-medium text-ink">
          Nouveau mot de passe
        </label>
        <Input
          id="password-nouveau"
          type="password"
          autoComplete="new-password"
          className="mt-1"
          aria-invalid={!!errors.nouveau_mot_de_passe}
          aria-describedby={errors.nouveau_mot_de_passe ? "password-nouveau-error" : undefined}
          {...register("nouveau_mot_de_passe")}
        />
        {errors.nouveau_mot_de_passe && (
          <p id="password-nouveau-error" className="mt-1 text-xs text-red-600">
            {errors.nouveau_mot_de_passe.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password-confirmation" className="block text-sm font-medium text-ink">
          Confirmer le nouveau mot de passe
        </label>
        <Input
          id="password-confirmation"
          type="password"
          autoComplete="new-password"
          className="mt-1"
          aria-invalid={!!errors.confirmation}
          aria-describedby={errors.confirmation ? "password-confirmation-error" : undefined}
          {...register("confirmation")}
        />
        {errors.confirmation && (
          <p id="password-confirmation-error" className="mt-1 text-xs text-red-600">
            {errors.confirmation.message}
          </p>
        )}
      </div>

      <p className="rounded-xl bg-surface px-3 py-2.5 text-xs text-muted">
        La modification du mot de passe déconnecte toutes vos sessions actives.
      </p>

      <div className="flex justify-end border-t border-border pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand text-white hover:bg-brand-dark"
        >
          <KeyRound className="h-4 w-4" />
          {isSubmitting ? "Modification..." : "Modifier le mot de passe"}
        </Button>
      </div>
    </form>
  );
}
