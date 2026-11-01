import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../components/Input";
import { AuthAlert } from "./AuthAlert";
import { login, register as registerAccount } from "../../../services/authService";
import { getApiError } from "../../../services/apiError";
import { useAuth } from "../../../context/authContextCore";
import { getRoleHome } from "../lib/roleHome";

const schema = z
  .object({
    telephone: z
      .string()
      .trim()
      .min(8, "Numéro de téléphone invalide")
      .max(20, "Numéro de téléphone trop long"),
    nom_entreprise: z
      .string()
      .trim()
      .min(1, "Nom de l'entreprise requis")
      .max(255, "Nom de l'entreprise trop long"),
    adresse: z.string().trim().min(1, "Adresse requise").max(255, "Adresse trop longue"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    password2: z.string().min(1, "Confirmation requise"),
  })
  .refine((data) => data.password === data.password2, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password2"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    const payload = {
      telephone: data.telephone,
      password: data.password,
      nom_entreprise: data.nom_entreprise,
      adresse: data.adresse,
    };

    try {
      await registerAccount(payload);

      try {
        const res = await login({ telephone: payload.telephone, password: payload.password });
        setUser(res.utilisateur);
        navigate(getRoleHome(res.utilisateur.role), { replace: true });
      } catch {
        navigate("/auth/login", {
          replace: true,
          state: { message: "Votre compte a été créé. Connectez-vous pour continuer." },
        });
      }
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);

      (["telephone", "nom_entreprise", "adresse", "password"] as const).forEach((field) => {
        if (fields[field]) setError(field, { message: fields[field] });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <AuthAlert variant="error">{formError}</AuthAlert>}

      <div>
        <label htmlFor="register-telephone" className="block text-sm text-gray-700">
          Téléphone
        </label>
        <Input
          id="register-telephone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Ex : 0600000000"
          aria-invalid={!!errors.telephone}
          aria-describedby={errors.telephone ? "register-telephone-error" : undefined}
          {...register("telephone")}
        />
        {errors.telephone && (
          <p id="register-telephone-error" className="mt-1 text-xs text-red-600">
            {errors.telephone.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-entreprise" className="block text-sm text-gray-700">
          Nom de l'entreprise
        </label>
        <Input
          id="register-entreprise"
          autoComplete="organization"
          placeholder="Ex : Ma Société"
          aria-invalid={!!errors.nom_entreprise}
          aria-describedby={errors.nom_entreprise ? "register-entreprise-error" : undefined}
          {...register("nom_entreprise")}
        />
        {errors.nom_entreprise && (
          <p id="register-entreprise-error" className="mt-1 text-xs text-red-600">
            {errors.nom_entreprise.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-adresse" className="block text-sm text-gray-700">
          Adresse
        </label>
        <Input
          id="register-adresse"
          autoComplete="street-address"
          placeholder="Ex : 123 Rue de la Paix, 75000 Paris"
          aria-invalid={!!errors.adresse}
          aria-describedby={errors.adresse ? "register-adresse-error" : undefined}
          {...register("adresse")}
        />
        {errors.adresse && (
          <p id="register-adresse-error" className="mt-1 text-xs text-red-600">
            {errors.adresse.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm text-gray-700">
          Mot de passe
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "register-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="register-password-error" className="mt-1 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-password2" className="block text-sm text-gray-700">
          Confirmer le mot de passe
        </label>
        <Input
          id="register-password2"
          type="password"
          autoComplete="new-password"
          placeholder="********"
          aria-invalid={!!errors.password2}
          aria-describedby={errors.password2 ? "register-password2-error" : undefined}
          {...register("password2")}
        />
        {errors.password2 && (
          <p id="register-password2-error" className="mt-1 text-xs text-red-600">
            {errors.password2.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Création..." : "S'inscrire"}
      </Button>

      <p className="text-center text-xs text-gray-500">
        Un essai gratuit est activé automatiquement à la création du compte.
      </p>
    </form>
  );
}

export default RegisterForm;
