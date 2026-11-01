import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins, Search, UserRound } from "lucide-react";
import { collecterEncaissement } from "../../../services/encaissementService";
import { getApiError } from "../../../services/apiError";
import type { Client, Encaissement } from "../../../types/fournisseur";
import { formatMoney } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";
import { Select } from "../../../shared/ui/select";
import { Textarea } from "../../../shared/ui/textarea";

const schema = z.object({
  client: z.string().min(1, "Sélectionnez un client."),
  montant: z
    .string()
    .trim()
    .min(1, "Le montant est requis.")
    .refine((value) => {
      const amount = Number(value.replace(",", "."));
      return Number.isFinite(amount) && amount > 0;
    }, "Saisissez un montant supérieur à zéro."),
  commentaire: z.string().max(500, "Le commentaire ne peut pas dépasser 500 caractères."),
});

type FormData = z.infer<typeof schema>;

export function CollecteEncaissementModal({
  open,
  clients,
  onClose,
  onSuccess,
}: {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onSuccess: (encaissement: Encaissement) => void;
}) {
  const [clientSearch, setClientSearch] = useState("");
  const [pending, setPending] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { client: "", montant: "", commentaire: "" },
  });

  const selectedClientId = useWatch({ control, name: "client" });
  const selectedClient = clients.find((client) => String(client.id) === selectedClientId);

  const activeClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase();
    return clients.filter((client) => {
      if (!client.compte_active) return false;
      if (!term) return true;
      return (
        `${client.prenom} ${client.nom}`.toLowerCase().includes(term) ||
        client.telephone.toLowerCase().includes(term)
      );
    });
  }, [clients, clientSearch]);

  const submitForm = (data: FormData) => {
    setFormError(null);
    setPending(data);
  };

  const confirmCollection = async () => {
    if (!pending) return;

    setLoading(true);
    setFormError(null);

    try {
      const encaissement = await collecterEncaissement({
        client: Number(pending.client),
        montant: pending.montant.replace(",", "."),
        commentaire: pending.commentaire.trim(),
      });
      onSuccess(encaissement);
      setPending(null);
    } catch (error) {
      const { message, fields } = getApiError(error);
      setFormError(message);
      setPending(null);
      if (fields.client) setError("client", { message: fields.client });
      if (fields.montant) setError("montant", { message: fields.montant });
      if (fields.commentaire) setError("commentaire", { message: fields.commentaire });
      if (fields.detail) setFormError(fields.detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Collecter un encaissement"
        description="Enregistrez un paiement reçu sur le terrain. L'encaissement sera confirmé immédiatement."
        size="lg"
      >
        <form onSubmit={handleSubmit(submitForm)} className="space-y-5" noValidate>
          {formError && <Alert variant="error">{formError}</Alert>}

          <div className="rounded-2xl border border-brand/10 bg-brand-soft/60 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-brand">
              <HandCoins className="h-4 w-4" aria-hidden="true" />
              Informations du paiement
            </div>
            <p className="mt-1 text-xs text-brand/70">
              Le client doit avoir un compte activé. Le montant sera débité de son solde dès la
              confirmation.
            </p>
          </div>

          <div>
            <label htmlFor="collecte-client-search" className="block text-sm font-medium text-ink">
              Rechercher un client
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                id="collecte-client-search"
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder="Nom ou téléphone"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label htmlFor="collecte-client" className="block text-sm font-medium text-ink">
              Client
            </label>
            <Select
              id="collecte-client"
              className="mt-1"
              aria-invalid={!!errors.client}
              aria-describedby={errors.client ? "collecte-client-error" : undefined}
              {...register("client")}
            >
              <option value="">Sélectionner un client</option>
              {activeClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.prenom} {client.nom} — {client.telephone}
                </option>
              ))}
            </Select>
            {errors.client && (
              <p id="collecte-client-error" className="mt-1 text-xs text-red-600">
                {errors.client.message}
              </p>
            )}
            {activeClients.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Aucun client activé ne correspond à votre recherche.
              </p>
            )}
          </div>

          {selectedClient && (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-medium text-ink">
                  {selectedClient.prenom} {selectedClient.nom}
                </p>
                <p className="text-xs text-muted">
                  Solde dû : {formatMoney(selectedClient.solde_du)} · Disponible :{" "}
                  {formatMoney(selectedClient.solde_disponible)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="collecte-montant" className="block text-sm font-medium text-ink">
              Montant reçu
            </label>
            <Input
              id="collecte-montant"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              className="mt-1"
              aria-invalid={!!errors.montant}
              aria-describedby={errors.montant ? "collecte-montant-error" : undefined}
              {...register("montant")}
            />
            {errors.montant && (
              <p id="collecte-montant-error" className="mt-1 text-xs text-red-600">
                {errors.montant.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="collecte-commentaire" className="block text-sm font-medium text-ink">
              Commentaire <span className="font-normal text-muted">(optionnel)</span>
            </label>
            <Textarea
              id="collecte-commentaire"
              rows={3}
              placeholder="Référence du paiement, précision..."
              className="mt-1"
              {...register("commentaire")}
            />
            {errors.commentaire && (
              <p className="mt-1 text-xs text-red-600">{errors.commentaire.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-brand text-white hover:bg-brand-dark"
              disabled={activeClients.length === 0}
            >
              <HandCoins className="h-4 w-4" />
              Vérifier le récapitulatif
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pending}
        title="Confirmer l'encaissement"
        description={
          pending
            ? `Confirmer la réception de ${formatMoney(
                Number(pending.montant.replace(",", ".")),
              )} pour ${
                selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : "ce client"
              } ?`
            : ""
        }
        confirmLabel="Confirmer et encaisser"
        tone="default"
        loading={loading}
        onConfirm={confirmCollection}
        onClose={() => setPending(null)}
      />
    </>
  );
}
