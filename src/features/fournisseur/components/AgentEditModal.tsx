import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { updateAgent } from "../../../services/agentService";
import { getApiError } from "../../../services/apiError";
import type { Agent } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";

const schema = z.object({
  nom: z.string().trim().max(150, "Le nom ne peut pas dépasser 150 caractères."),
  prenom: z.string().trim().max(150, "Le prénom ne peut pas dépasser 150 caractères."),
  zone: z.string().trim().max(255, "La zone ne peut pas dépasser 255 caractères."),
});

type FormData = z.infer<typeof schema>;

export function AgentEditModal({
  agent,
  onClose,
  onSaved,
}: {
  agent: Agent;
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
    defaultValues: {
      nom: agent.nom ?? "",
      prenom: agent.prenom ?? "",
      zone: agent.zone ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setFormError(null);

    try {
      const updated = await updateAgent(agent.id, {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        zone: data.zone.trim(),
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      if (fields.nom) setError("nom", { message: fields.nom });
      if (fields.prenom) setError("prenom", { message: fields.prenom });
      if (fields.zone) setError("zone", { message: fields.zone });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Modifier l'agent"
      description="Le numéro de téléphone ne peut pas être modifié."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="agent-edit-nom" className="block text-sm font-medium text-ink">
              Nom
            </label>
            <Input
              id="agent-edit-nom"
              autoComplete="family-name"
              className="mt-1"
              aria-invalid={!!errors.nom}
              aria-describedby={errors.nom ? "agent-edit-nom-error" : undefined}
              {...register("nom")}
            />
            {errors.nom && (
              <p id="agent-edit-nom-error" className="mt-1 text-xs text-red-600">
                {errors.nom.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="agent-edit-prenom" className="block text-sm font-medium text-ink">
              Prénom
            </label>
            <Input
              id="agent-edit-prenom"
              autoComplete="given-name"
              className="mt-1"
              aria-invalid={!!errors.prenom}
              aria-describedby={errors.prenom ? "agent-edit-prenom-error" : undefined}
              {...register("prenom")}
            />
            {errors.prenom && (
              <p id="agent-edit-prenom-error" className="mt-1 text-xs text-red-600">
                {errors.prenom.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="agent-edit-telephone" className="block text-sm font-medium text-ink">
            Numéro de téléphone
          </label>
          <Input
            id="agent-edit-telephone"
            type="tel"
            value={agent.telephone}
            disabled
            className="mt-1 bg-surface"
          />
        </div>

        <div>
          <label htmlFor="agent-edit-zone" className="block text-sm font-medium text-ink">
            Zone / secteur
          </label>
          <Input
            id="agent-edit-zone"
            placeholder="Ex : Centre-ville"
            className="mt-1"
            aria-invalid={!!errors.zone}
            aria-describedby={errors.zone ? "agent-edit-zone-error" : undefined}
            {...register("zone")}
          />
          {errors.zone && (
            <p id="agent-edit-zone-error" className="mt-1 text-xs text-red-600">
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
            <Save className="h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
