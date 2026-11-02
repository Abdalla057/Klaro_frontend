import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowRight, Banknote, CheckCircle2, Info, Send } from "lucide-react";
import { createDemandeDecaissement } from "../../../services/financeService";
import { getApiError } from "../../../services/apiError";
import type { DemandeDecaissement } from "../../../types/fournisseur";
import { formatMoney } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { CardSkeleton } from "../../../shared/ui/loading";
import { ErrorState } from "../../../shared/ui/error-state";
import { Input } from "../../../shared/ui/input";
import { PageHeader } from "../../../shared/ui/page-header";
import { Textarea } from "../../../shared/ui/textarea";
import { useClient } from "../context/clientContextCore";

const schema = z.object({
  montant: z
    .string()
    .min(1, "Le montant est requis.")
    .refine((value) => {
      const amount = Number(value.replace(",", "."));
      return Number.isFinite(amount) && amount > 0;
    }, "Saisissez un montant supérieur à zéro.")
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value.replace(",", ".")),
      "Saisissez un montant valide avec au maximum deux décimales.",
    ),
  commentaire: z.string().max(500, "Le commentaire ne peut pas dépasser 500 caractères."),
});

type FormData = z.infer<typeof schema>;

export function DemandeDecaissementPage() {
  const { profil, solde, loading, error, refresh } = useClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<DemandeDecaissement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { montant: "", commentaire: "" },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    if (!profil?.compte_active) {
      setFormError("Votre compte doit être activé pour demander un décaissement.");
      return;
    }

    const montant = data.montant.replace(",", ".");
    const disponible = Number(solde?.solde_disponible ?? 0);

    if (Number(montant) > disponible) {
      setError("montant", {
        message: `Le montant dépasse votre solde disponible (${formatMoney(disponible)}).`,
      });
      return;
    }

    try {
      const demande = await createDemandeDecaissement({
        montant,
        commentaire: data.commentaire.trim() || undefined,
        cle_idempotence: crypto.randomUUID(),
      });
      setCreated(demande);
      reset();
      refresh();
    } catch (err) {
      const apiError = getApiError(err);
      setFormError(apiError.message);
      if (apiError.fields.montant) {
        setError("montant", { message: apiError.fields.montant });
      }
      if (apiError.fields.commentaire) {
        setError("commentaire", { message: apiError.fields.commentaire });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Demander un décaissement"
          description="Soumettez une demande de retrait sur votre solde disponible."
        />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <CardSkeleton className="h-96" />
          <CardSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  const disponible = Number(solde?.solde_disponible ?? 0);
  const blocked = !profil?.compte_active || disponible <= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demander un décaissement"
        description="Votre demande sera transmise à un agent pour confirmation, puis au fournisseur pour décision."
      />

      {created && (
        <Alert variant="success" title="Demande envoyée">
          <p>
            Votre demande <strong>{created.reference}</strong> de{" "}
            {formatMoney(created.montant)} a bien été enregistrée.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-brand text-white hover:bg-brand-dark">
              <Link to="/client/demandes">
                Suivre mes demandes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setCreated(null)}>
              Fermer
            </Button>
          </div>
        </Alert>
      )}

      {!profil?.compte_active && (
        <Alert variant="warning" title="Activation requise">
          Activez votre compte avec le code fourni par votre fournisseur avant de demander un
          décaissement.
        </Alert>
      )}

      {profil?.compte_active && disponible <= 0 && (
        <Alert variant="info" title="Aucun montant disponible">
          Votre solde disponible est nul. Annulez une demande en cours ou attendez un
          remboursement pour libérer du solde.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-ink">Nouvelle demande</h2>
            <p className="mt-1 text-sm text-muted">
              Indiquez le montant souhaité et un commentaire si nécessaire.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-5" noValidate>
            {formError && <Alert variant="error">{formError}</Alert>}

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="montant" className="block text-sm font-medium text-ink">
                  Montant à demander
                </label>
                <span className="text-xs text-muted">
                  Disponible : {formatMoney(disponible)}
                </span>
              </div>
              <Input
                id="montant"
                inputMode="decimal"
                placeholder="Ex : 50000"
                autoComplete="off"
                className="mt-1"
                aria-invalid={!!errors.montant}
                aria-describedby={errors.montant ? "montant-error" : undefined}
                {...register("montant")}
              />
              {errors.montant && (
                <p id="montant-error" className="mt-1 text-xs text-red-600">
                  {errors.montant.message}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {[0.25, 0.5, 1].map((part) => (
                  <button
                    key={part}
                    type="button"
                    disabled={disponible <= 0}
                    onClick={() => {
                      const value = (disponible * part).toFixed(2);
                      setValue("montant", value, { shouldValidate: true, shouldDirty: true });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {part === 1 ? "Tout le solde" : `${part * 100} %`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="commentaire" className="block text-sm font-medium text-ink">
                Commentaire <span className="font-normal text-muted">(facultatif)</span>
              </label>
              <Textarea
                id="commentaire"
                placeholder="Précisez le motif ou toute information utile."
                className="mt-1"
                aria-invalid={!!errors.commentaire}
                aria-describedby={errors.commentaire ? "commentaire-error" : undefined}
                {...register("commentaire")}
              />
              {errors.commentaire && (
                <p id="commentaire-error" className="mt-1 text-xs text-red-600">
                  {errors.commentaire.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                Le montant reste réservé jusqu'à la décision finale.
              </p>
              <Button
                type="submit"
                disabled={isSubmitting || blocked}
                className="bg-brand text-white hover:bg-brand-dark"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Envoi..." : "Envoyer la demande"}
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Votre solde</h2>
                <p className="mt-0.5 text-sm text-muted">Montant encore mobilisable.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Banknote className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {formatMoney(solde?.solde_disponible ?? 0)}
            </p>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Solde dû</dt>
                <dd className="font-medium text-ink">{formatMoney(solde?.solde_du ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Montant en cours</dt>
                <dd className="font-medium text-ink">
                  {formatMoney(solde?.montant_en_cours ?? 0)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Après l'envoi</h2>
            <ol className="mt-3 space-y-3 text-sm text-muted">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                Un agent confirme votre demande.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                Le fournisseur approuve ou refuse la demande.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                Une fois payée, le montant est déduit de votre solde dû.
              </li>
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Vous pouvez annuler votre demande tant qu'elle n'est pas payée, refusée ou annulée.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default DemandeDecaissementPage;
