import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CalendarDays, Hash, Phone, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../context/authContextCore";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { CardSkeleton } from "../../../shared/ui/loading";
import { ErrorState } from "../../../shared/ui/error-state";
import { PageHeader } from "../../../shared/ui/page-header";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileForm } from "../components/ProfileForm";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate } from "../lib/format";

export function ProfilPage() {
  const { profil, loading, error, refresh } = useFournisseur();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Mon profil et paramètres
          </h1>
          <p className="mt-1 text-sm text-muted">
            Gérez les informations de votre entreprise et la sécurité de votre compte.
          </p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!profil) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon profil et paramètres"
          description="Gérez les informations de votre entreprise et la sécurité de votre compte."
        />
        <Alert variant="warning" title="Profil introuvable">
          Impossible de charger les informations de votre entreprise. Contactez l'administrateur.
        </Alert>
      </div>
    );
  }

  const handlePasswordChanged = () => {
    logoutLocal();
    navigate("/auth/login", {
      replace: true,
      state: {
        message:
          "Votre mot de passe a été modifié. Reconnectez-vous avec votre nouveau mot de passe.",
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil et paramètres"
        description="Gérez les informations de votre entreprise et la sécurité de votre compte."
      />

      {success && <Alert variant="success">{success}</Alert>}

      {profil.est_suspendu && (
        <Alert variant="warning" title="Compte suspendu">
          Votre entreprise est actuellement suspendue.
          {profil.motif_suspension ? ` Motif : ${profil.motif_suspension}` : ""} Contactez
          l'administrateur pour plus d'informations.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-ink">Informations de l'entreprise</h2>
            <p className="mt-1 text-sm text-muted">
              Ces informations sont visibles par vos clients et vos agents.
            </p>
          </div>
          <div className="pt-5">
            <ProfileForm
              key={profil.id}
              profil={profil}
              onSaved={() => {
                setSuccess("Les informations de votre entreprise ont été mises à jour.");
                refresh();
              }}
            />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-base font-semibold text-ink">Mon compte</h2>
                <p className="mt-1 text-sm text-muted">Identifiants et informations de création.</p>
              </div>
              <Badge tone={profil.est_suspendu ? "danger" : "success"}>
                {profil.est_suspendu ? "Suspendu" : "Actif"}
              </Badge>
            </div>

            <dl className="space-y-3 pt-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Entreprise
                </dt>
                <dd className="text-right font-medium text-ink">{profil.nom_entreprise}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  Téléphone
                </dt>
                <dd className="text-right font-medium text-ink">{profil.telephone}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                  Code entreprise
                </dt>
                <dd className="text-right font-medium text-ink">{profil.code_entreprise}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Créé le
                </dt>
                <dd className="text-right text-ink">{formatDate(profil.date_creation)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3 border-b border-border pb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Sécurité</h2>
                <p className="mt-1 text-sm text-muted">Modifiez votre mot de passe.</p>
              </div>
            </div>
            <div className="pt-5">
              <PasswordForm onChanged={handlePasswordChanged} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
