import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { createAgent } from "../../../services/agentService";
import { getApiError } from "../../../services/apiError";
import type { Agent } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";

const schema = z.object({
  nom: z.string().trim().max(150, "Le nom ne peut pas dépasser 150 caractères."),
  prenom: z.string().trim().max(150, "Le prénom ne peut pas dépasser 150 caractères."),
  telephone: z
    .string()
    .trim()
    .min(8, "Le numéro doit contenir au moins 8 caractères.")
    .max(20, "Le numéro ne peut pas dépasser 20 caractères.")
    .regex(/^[0-9+\s().-]+$/, "Numéro de téléphone invalide."),
  zone: z.string().trim().max(255, "La zone ne peut pas dépasser 255 caractères."),
});

type FormData = z.infer<typeof schema>;

export function AgentCreateModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (agent: Agent) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nom: "", prenom: "", telephone: "", zone: "" },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      const agent = await createAgent({
        nom: data.nom.trim() || undefined,
        prenom: data.prenom.trim() || undefined,
        telephone: data.telephone.trim(),
        zone: data.zone.trim() || undefined,
      });
      onSaved(agent);
      onClose();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.nom) setError("nom", { message: fields.nom });
      if (fields.prenom) setError("prenom", { message: fields.prenom });
      if (fields.telephone) setError("telephone", { message: fields.telephone });
      if (fields.zone) setError("zone", { message: fields.zone });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Ajouter un agent"
      description="Un code d'activation sera généré et devra être communiqué manuellement à l'agent."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="agent-nom" className="block text-sm font-medium text-ink">
              Nom <span className="font-normal text-muted">(optionnel)</span>
            </label>
            <Input
              id="agent-nom"
              autoComplete="family-name"
              placeholder="Ex : Traoré"
              className="mt-1"
              aria-invalid={!!errors.nom}
              aria-describedby={errors.nom ? "agent-nom-error" : undefined}
              {...register("nom")}
            />
            {errors.nom && (
              <p id="agent-nom-error" className="mt-1 text-xs text-red-600">
                {errors.nom.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="agent-prenom" className="block text-sm font-medium text-ink">
              Prénom <span className="font-normal text-muted">(optionnel)</span>
            </label>
            <Input
              id="agent-prenom"
              autoComplete="given-name"
              placeholder="Ex : Moussa"
              className="mt-1"
              aria-invalid={!!errors.prenom}
              aria-describedby={errors.prenom ? "agent-prenom-error" : undefined}
              {...register("prenom")}
            />
            {errors.prenom && (
              <p id="agent-prenom-error" className="mt-1 text-xs text-red-600">
                {errors.prenom.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="agent-telephone" className="block text-sm font-medium text-ink">
            Numéro de téléphone
          </label>
          <Input
            id="agent-telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ex : 0600000000"
            className="mt-1"
            aria-invalid={!!errors.telephone}
            aria-describedby={errors.telephone ? "agent-telephone-error" : undefined}
            {...register("telephone")}
          />
          {errors.telephone && (
            <p id="agent-telephone-error" className="mt-1 text-xs text-red-600">
              {errors.telephone.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="agent-zone" className="block text-sm font-medium text-ink">
            Zone / secteur <span className="font-normal text-muted">(optionnel)</span>
          </label>
          <Input
            id="agent-zone"
            placeholder="Ex : Centre-ville"
            className="mt-1"
            aria-invalid={!!errors.zone}
            aria-describedby={errors.zone ? "agent-zone-error" : undefined}
            {...register("zone")}
          />
          {errors.zone && (
            <p id="agent-zone-error" className="mt-1 text-xs text-red-600">
              {errors.zone.message}
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
            {isSubmitting ? "Ajout..." : "Ajouter l'agent"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
