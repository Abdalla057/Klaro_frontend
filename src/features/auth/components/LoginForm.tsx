import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { login } from "../../../services/authService";
import { getStatutActivation } from "../../../services/activationService";
import { getApiError } from "../../../services/apiError";
import { useAuth } from "../../../context/authContextCore";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../components/Input";
import { AuthAlert } from "./AuthAlert";
import { getRoleHome } from "../lib/roleHome";

const schema = z.object({
  telephone: z
    .string()
    .trim()
    .min(8, "Numéro de téléphone invalide")
    .max(20, "Numéro de téléphone trop long"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [activationPhone, setActivationPhone] = useState<string | null>(null);
  const [activationRole, setActivationRole] = useState<"client" | "agent" | null>(null);

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
    setActivationPhone(null);
    setActivationRole(null);

    try {
      const res = await login(data);
      setUser(res.utilisateur);

      const state = location.state as { from?: string } | null;
      navigate(state?.from || getRoleHome(res.utilisateur.role), { replace: true });
    } catch (error) {
      const { message, fields, status } = getApiError(error, {
        unauthorizedMessage: "Téléphone ou mot de passe incorrect.",
      });

      if (status === 401) {
        try {
          const statut = await getStatutActivation(data.telephone);
          if (
            !statut.compte_active &&
            (statut.role === "client" || statut.role === "agent")
          ) {
            setActivationPhone(statut.telephone);
            setActivationRole(statut.role);
            setFormError(
              "Ce compte existe mais n'est pas encore activé. Utilisez le code fourni par votre fournisseur pour choisir votre mot de passe.",
            );
            return;
          }
          if (!statut.compte_active) {
            setFormError(
              "Ce compte n'est pas encore actif. Contactez votre administrateur.",
            );
            return;
          }
        } catch {
          // Le statut d'activation est indisponible : on affiche l'erreur de connexion.
        }
      }

      setFormError(message);

      if (fields.telephone) setError("telephone", { message: fields.telephone });
      if (fields.password) setError("password", { message: fields.password });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <AuthAlert variant="error">{formError}</AuthAlert>}

      {activationPhone && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            navigate(
              `${
                activationRole === "client" ? "/auth/activation/client" : "/auth/activation"
              }?telephone=${encodeURIComponent(activationPhone)}`,
            )
          }
        >
          <KeyRound className="h-4 w-4" />
          Activer mon compte avec mon code
        </Button>
      )}

      <div>
        <label htmlFor="login-telephone" className="mb-1.5 block text-sm font-medium text-ink">
          Téléphone
        </label>
        <Input
          id="login-telephone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Ex : 0600000000"
          aria-invalid={!!errors.telephone}
          aria-describedby={errors.telephone ? "login-telephone-error" : undefined}
          {...register("telephone")}
        />
        {errors.telephone && (
          <p id="login-telephone-error" className="mt-1 text-xs text-red-600">
            {errors.telephone.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-ink">
          Mot de passe
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="login-password-error" className="mt-1 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}

export default LoginForm;
