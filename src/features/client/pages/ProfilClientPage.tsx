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
import { formatDate, formatMoney } from "../../../shared/utils/format";
import { Badge } from "../../../shared/ui/badge";
import { CardSkeleton } from "../../../shared/ui/loading";
import { ErrorState } from "../../../shared/ui/error-state";
import { PageHeader } from "../../../shared/ui/page-header";
import { PasswordForm } from "../../fournisseur/components/PasswordForm";
import { useClient } from "../context/clientContextCore";
import { clientFullName, clientInitials } from "../lib/dashboard";
import { compteClientStatus } from "../lib/status";

export function ProfilClientPage() {
  const { profil, solde, loading, error, refresh } = useClient();
  const { logoutLocal } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon profil"
          description="Consultez vos informations client et sécurisez votre compte."
        />
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <CardSkeleton className="h-80" />
          <CardSkeleton className="h-80" />
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
        message="Votre profil client est introuvable. Contactez votre fournisseur."
        onRetry={refresh}
      />
    );
  }

  const status = compteClientStatus(profil.compte_active);
  const fullName = clientFullName(profil);

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
        description="Consultez vos informations client et sécurisez votre compte."
      />

      <section className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-brand-accent/30 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-semibold text-brand shadow-lg">
              {clientInitials(profil)}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Compte client
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{fullName}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {profil.telephone}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={status.tone} className="bg-white/10 text-white ring-white/15">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {status.label}
            </Badge>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70">
              Client #{profil.id}
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
                Ces informations sont gérées par votre fournisseur et ne peuvent pas être
                modifiées depuis cet espace.
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
                  Adresse
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">
                  {profil.adresse || "Non renseignée"}
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
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Date d'activation
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">
                  {formatDate(profil.date_activation)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                  <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                  Crédit initial
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink">
                  {profil.montant_credit_initial
                    ? formatMoney(profil.montant_credit_initial)
                    : "Non défini"}
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
                <h2 className="text-base font-semibold text-ink">Situation financière</h2>
                <p className="mt-1 text-sm text-muted">
                  Résumé de votre solde et des montants réservés.
                </p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <dt className="text-xs text-muted">Solde dû</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {formatMoney(solde?.solde_du ?? profil.solde_du)}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <dt className="text-xs text-muted">En cours</dt>
                <dd className="mt-1 text-sm font-semibold text-amber-700">
                  {formatMoney(solde?.montant_en_cours ?? 0)}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <dt className="text-xs text-muted">Disponible</dt>
                <dd className="mt-1 text-sm font-semibold text-emerald-700">
                  {formatMoney(solde?.solde_disponible ?? profil.solde_disponible)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted">
              Pour corriger vos informations personnelles, contactez directement votre
              fournisseur.
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

export default ProfilClientPage;
