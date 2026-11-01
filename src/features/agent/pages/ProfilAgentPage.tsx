import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../../context/authContextCore";
import { CardSkeleton } from "../../../shared/ui/loading";
import { ErrorState } from "../../../shared/ui/error-state";
import { PageHeader } from "../../../shared/ui/page-header";
import { Badge } from "../../../shared/ui/badge";
import { formatDate } from "../../../shared/utils/format";
import { PasswordForm } from "../../fournisseur/components/PasswordForm";
import { useAgent } from "../context/agentContextCore";
import { agentFullName, agentInitials } from "../lib/dashboard";
import { agentStatus } from "../lib/status";

export function ProfilAgentPage() {
  const { profil, loading, error, refresh } = useAgent();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon profil"
          description="Consultez vos informations d'agent et sécurisez votre compte."
        />
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <CardSkeleton className="h-72" />
          <CardSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!profil) {
    return (
      <ErrorState
        message="Votre profil agent est introuvable. Contactez votre fournisseur."
        onRetry={refresh}
      />
    );
  }

  const status = agentStatus(profil.compte_active);
  const fullName = agentFullName(profil);

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
        title="Mon profil"
        description="Consultez vos informations d'agent et sécurisez votre compte."
      />

      <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-brand-accent/30 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-semibold text-brand shadow-lg">
              {agentInitials(profil)}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Agent d'encaissement
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{fullName}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {profil.zone || "Zone non définie"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {status.label}
            </Badge>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70">
              Agent #{profil.id}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="border-b border-border pb-4">
              <h2 className="text-base font-semibold text-ink">Informations personnelles</h2>
              <p className="mt-1 text-sm text-muted">
                Ces informations sont gérées par votre fournisseur.
              </p>
            </div>
            <dl className="grid gap-5 pt-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  Nom complet
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">{fullName}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  Téléphone
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">{profil.telephone}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  Zone d'intervention
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">
                  {profil.zone || "Non définie"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Membre depuis
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">
                  {formatDate(profil.date_creation)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Wallet className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">Périmètre d'action</h2>
                <p className="mt-1 text-sm text-muted">
                  Vous pouvez collecter des encaissements, confirmer les paiements en attente et
                  confirmer les demandes de décaissement de votre fournisseur.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted">
              La gestion des clients, des soldes, des agents et la décision finale sur les
              décaissements restent réservées au fournisseur.
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 border-b border-border pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">Sécurité</h2>
              <p className="mt-1 text-sm text-muted">
                Modifiez votre mot de passe. Toutes vos sessions seront déconnectées.
              </p>
            </div>
          </div>
          <div className="pt-5">
            <PasswordForm onChanged={handlePasswordChanged} />
          </div>
        </section>
      </div>
    </div>
  );
}
