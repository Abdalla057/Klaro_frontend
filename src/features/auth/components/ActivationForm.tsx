import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { activerCompte } from "../../../services/activationService";
import { login } from "../../../services/authService";
import { getApiError } from "../../../services/apiError";
import { useAuth } from "../../../context/authContextCore";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "./Input";
import { AuthAlert } from "./AuthAlert";
import { getRoleHome } from "../lib/roleHome";

const schema = z
  .object({
    telephone: z
      .string()
      .trim()
      .min(8, "Numéro de téléphone invalide")
      .max(20, "Numéro de téléphone trop long"),
    code: z
      .string()
      .transform((value) => value.replace(/\s+/g, ""))
      .refine((value) => /^\d{6}$/.test(value), "Le code doit contenir 6 chiffres."),
    password: z.string().min(8, "Utilisez au moins 8 caractères."),
    confirmation: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

type FormData = z.infer<typeof schema>;

export function ActivationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      telephone: searchParams.get("telephone") ?? "",
      code: "",
      password: "",
      confirmation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      await activerCompte({
        telephone: data.telephone.trim(),
        code: data.code,
        password: data.password,
      });

      try {
        const res = await login({ telephone: data.telephone.trim(), password: data.password });
        setUser(res.utilisateur);
        navigate(getRoleHome(res.utilisateur.role), { replace: true });
      } catch {
        navigate("/auth/login", {
          replace: true,
          state: {
            message: "Votre compte est activé. Connectez-vous avec votre nouveau mot de passe.",
          },
        });
      }
    } catch (error) {
      const { message, fields } = getApiError(error, {
        unauthorizedMessage: "Impossible d'activer le compte avec ces informations.",
      });
      setFormError(message);

      if (fields.telephone) setError("telephone", { message: fields.telephone });
      if (fields.code) setError("code", { message: fields.code });
      if (fields.password) setError("password", { message: fields.password });
      if (fields.confirmation) setError("confirmation", { message: fields.confirmation });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <AuthAlert variant="error">{formError}</AuthAlert>}

      <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Saisissez le code à 6 chiffres fourni par votre fournisseur, puis choisissez votre mot de
          passe. Le code est valable 10 minutes.
        </span>
      </div>

      <div>
        <label htmlFor="activation-telephone" className="block text-sm text-gray-700">
          Téléphone
        </label>
        <Input
          id="activation-telephone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Ex : 0600000000"
          aria-invalid={!!errors.telephone}
          aria-describedby={errors.telephone ? "activation-telephone-error" : undefined}
          {...register("telephone")}
        />
        {errors.telephone && (
          <p id="activation-telephone-error" className="mt-1 text-xs text-red-600">
            {errors.telephone.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="activation-code" className="block text-sm text-gray-700">
          Code d'activation
        </label>
        <Input
          id="activation-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="text-center font-mono text-lg tracking-[0.35em]"
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? "activation-code-error" : undefined}
          {...register("code")}
        />
        {errors.code && (
          <p id="activation-code-error" className="mt-1 text-xs text-red-600">
            {errors.code.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="activation-password" className="block text-sm text-gray-700">
          Nouveau mot de passe
        </label>
        <Input
          id="activation-password"
          type="password"
          autoComplete="new-password"
          placeholder="Au moins 8 caractères"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "activation-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="activation-password-error" className="mt-1 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="activation-confirmation" className="block text-sm text-gray-700">
          Confirmer le mot de passe
        </label>
        <Input
          id="activation-confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="Saisissez à nouveau le mot de passe"
          aria-invalid={!!errors.confirmation}
          aria-describedby={errors.confirmation ? "activation-confirmation-error" : undefined}
          {...register("confirmation")}
        />
        {errors.confirmation && (
          <p id="activation-confirmation-error" className="mt-1 text-xs text-red-600">
            {errors.confirmation.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Activation..." : "Activer mon compte"}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Code expiré ou introuvable ? Contactez votre fournisseur pour en générer un nouveau.
      </p>
    </form>
  );
}

export default ActivationForm;
