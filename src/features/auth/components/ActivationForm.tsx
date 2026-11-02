import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import {
  definirMotDePasseActivation,
  verifierCodeActivation,
} from "../../../services/activationService";
import { login } from "../../../services/authService";
import { getApiError } from "../../../services/apiError";
import { useAuth } from "../../../context/authContextCore";
import type { UserRole } from "../../../types/auth";
import { Button } from "../../../shared/ui/button/button";
import { cn } from "../../../shared/utils/cn";
import { Input } from "./Input";
import { AuthAlert } from "./AuthAlert";
import { getRoleHome } from "../lib/roleHome";
import {
  activationSession,
  buildActivationSession,
  type ActivationSession,
} from "../lib/activationSession";

const codeSchema = z.object({
  telephone: z
    .string()
    .trim()
    .min(8, "Numéro de téléphone invalide")
    .max(20, "Numéro de téléphone trop long"),
  code: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .refine((value) => /^\d{6}$/.test(value), "Le code doit contenir 6 chiffres."),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Utilisez au moins 8 caractères."),
    confirmation: z.string().min(1, "Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

type CodeFormData = z.infer<typeof codeSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const SUPPORTED_ROLES: UserRole[] = ["client", "agent"];

function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    client: "client",
    agent: "agent",
    fournisseur: "fournisseur",
    super_admin: "super administrateur",
  };
  return labels[role] ?? role;
}

export function ActivationForm({ expectedRole }: { expectedRole?: "client" | "agent" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  const [session, setSession] = useState<ActivationSession | null>(() => {
    const restored = activationSession.get();
    if (!restored) return null;
    if (expectedRole && restored.role !== expectedRole) {
      activationSession.clear();
      return null;
    }
    return restored;
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      telephone: session?.telephone ?? searchParams.get("telephone") ?? "",
      code: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  const step = session ? 2 : 1;

  const onVerify = async (data: CodeFormData) => {
    setFormError(null);

    try {
      const result = await verifierCodeActivation({
        telephone: data.telephone.trim(),
        code: data.code,
      });

      if (!SUPPORTED_ROLES.includes(result.role)) {
        setFormError(
          "Ce compte ne peut pas être activé depuis cet espace. Contactez votre fournisseur.",
        );
        return;
      }

      if (expectedRole && result.role !== expectedRole) {
        setFormError(
          `Ce numéro correspond à un compte ${roleLabel(
            result.role,
          )}. Utilisez l'espace d'activation correspondant.`,
        );
        return;
      }

      const nextSession = buildActivationSession(
        result.telephone,
        result.token,
        result.role,
        result.expire_dans_minutes,
      );

      activationSession.save(nextSession);
      setSession(nextSession);
      passwordForm.reset();
    } catch (error) {
      const { message, fields } = getApiError(error, {
        unauthorizedMessage: "Impossible de vérifier le code d'activation.",
      });
      setFormError(message);

      if (fields.telephone) codeForm.setError("telephone", { message: fields.telephone });
      if (fields.code) codeForm.setError("code", { message: fields.code });
      if (fields.non_field_errors) setFormError(fields.non_field_errors);
    }
  };

  const onDefinePassword = async (data: PasswordFormData) => {
    if (!session) return;
    setFormError(null);

    try {
      await definirMotDePasseActivation({
        telephone: session.telephone,
        token: session.token,
        password: data.password,
        confirmation: data.confirmation,
      });

      activationSession.clear();

      try {
        const response = await login({ telephone: session.telephone, password: data.password });

        if (expectedRole && response.utilisateur.role !== expectedRole) {
          setUser(null);
          setSession(null);
          setFormError(
            `Ce numéro correspond à un compte ${roleLabel(
              response.utilisateur.role,
            )}. L'accès à cet espace est refusé.`,
          );
          return;
        }

        setUser(response.utilisateur);
        navigate(getRoleHome(response.utilisateur.role), { replace: true });
      } catch {
        navigate("/auth/login", {
          replace: true,
          state: {
            message:
              "Votre compte est activé. Connectez-vous avec votre nouveau mot de passe.",
          },
        });
      }
    } catch (error) {
      const { message, fields } = getApiError(error, {
        unauthorizedMessage: "Impossible de définir le mot de passe.",
      });
      setFormError(message);

      if (fields.password) passwordForm.setError("password", { message: fields.password });
      if (fields.confirmation) {
        passwordForm.setError("confirmation", { message: fields.confirmation });
      }
      if (fields.token || fields.detail) {
        activationSession.clear();
        setSession(null);
        codeForm.setValue("code", "");
      }
    }
  };

  const restart = () => {
    activationSession.clear();
    setSession(null);
    setFormError(null);
    passwordForm.reset();
    codeForm.setValue("code", "");
  };

  return (
    <div className="space-y-5">
      <ol className="flex items-center gap-2" aria-label="Étapes d'activation">
        <li className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              step === 1
                ? "bg-brand text-white"
                : "bg-emerald-100 text-emerald-700",
            )}
          >
            {step === 1 ? "1" : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          </span>
          <span className={cn("text-xs font-medium", step === 1 ? "text-ink" : "text-muted")}>
            Vérification
          </span>
        </li>
        <li className="h-px flex-1 bg-border" aria-hidden="true" />
        <li className="flex flex-1 items-center justify-end gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              step === 2 ? "text-ink" : "text-muted",
            )}
          >
            Mot de passe
          </span>
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              step === 2 ? "bg-brand text-white" : "bg-surface text-muted",
            )}
          >
            2
          </span>
        </li>
      </ol>

      {formError && <AuthAlert variant="error">{formError}</AuthAlert>}

      {step === 1 ? (
        <form onSubmit={codeForm.handleSubmit(onVerify)} className="space-y-4" noValidate>
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Saisissez le numéro de téléphone et le code à 6 chiffres fournis par votre
              fournisseur. Le code est valable 10 minutes.
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
              aria-invalid={!!codeForm.formState.errors.telephone}
              aria-describedby={
                codeForm.formState.errors.telephone ? "activation-telephone-error" : undefined
              }
              {...codeForm.register("telephone")}
            />
            {codeForm.formState.errors.telephone && (
              <p id="activation-telephone-error" className="mt-1 text-xs text-red-600">
                {codeForm.formState.errors.telephone.message}
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
              aria-invalid={!!codeForm.formState.errors.code}
              aria-describedby={
                codeForm.formState.errors.code ? "activation-code-error" : undefined
              }
              {...codeForm.register("code")}
            />
            {codeForm.formState.errors.code && (
              <p id="activation-code-error" className="mt-1 text-xs text-red-600">
                {codeForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={codeForm.formState.isSubmitting}
          >
            {codeForm.formState.isSubmitting ? "Vérification..." : "Vérifier le code"}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Code expiré ou introuvable ? Contactez votre fournisseur pour en générer un nouveau.
          </p>
        </form>
      ) : (
        <form onSubmit={passwordForm.handleSubmit(onDefinePassword)} className="space-y-4" noValidate>
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Code vérifié pour <strong>{session?.telephone}</strong>. Choisissez maintenant le
              mot de passe de votre compte.
            </span>
          </div>

          <div>
            <label htmlFor="activation-password" className="block text-sm text-gray-700">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Input
                id="activation-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Au moins 8 caractères"
                className="pr-10"
                aria-invalid={!!passwordForm.formState.errors.password}
                aria-describedby={
                  passwordForm.formState.errors.password ? "activation-password-error" : undefined
                }
                {...passwordForm.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p id="activation-password-error" className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="activation-confirmation" className="block text-sm text-gray-700">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Input
                id="activation-confirmation"
                type={showConfirmation ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Saisissez à nouveau le mot de passe"
                className="pr-10"
                aria-invalid={!!passwordForm.formState.errors.confirmation}
                aria-describedby={
                  passwordForm.formState.errors.confirmation
                    ? "activation-confirmation-error"
                    : undefined
                }
                {...passwordForm.register("confirmation")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmation((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={
                  showConfirmation
                    ? "Masquer la confirmation"
                    : "Afficher la confirmation"
                }
              >
                {showConfirmation ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.confirmation && (
              <p id="activation-confirmation-error" className="mt-1 text-xs text-red-600">
                {passwordForm.formState.errors.confirmation.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={passwordForm.formState.isSubmitting}
          >
            {passwordForm.formState.isSubmitting
              ? "Activation..."
              : "Définir mon mot de passe"}
          </Button>

          <button
            type="button"
            onClick={restart}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Modifier le numéro ou le code
          </button>
        </form>
      )}
    </div>
  );
}

export default ActivationForm;
