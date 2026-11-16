import { useMemo, useState } from "react";
import {
  Building2,
  ClipboardList,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  XCircle,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import {
  annulerCommande,
  createCommandeAchat,
  createFournisseurMarchandise,
  getAllCommandesAchat,
  getAllFournisseursMarchandises,
  getAllProduits,
  getCommandeReceptions,
  receptionnerCommande,
  updateFournisseurMarchandise,
} from "../../../services/commerceService";
import type {
  CommandeAchat,
  FournisseurMarchandise,
  Reception,
} from "../../../types/commerce";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
import { ConfirmDialog } from "../../../shared/ui/confirm-dialog";
import { EmptyState } from "../../../shared/ui/empty-state";
import { ErrorState } from "../../../shared/ui/error-state";
import { Input } from "../../../shared/ui/input";
import { TableSkeleton } from "../../../shared/ui/loading";
import { Modal } from "../../../shared/ui/modal";
import { PageHeader } from "../../../shared/ui/page-header";
import { Pagination } from "../../../shared/ui/pagination";
import { Select } from "../../../shared/ui/select";
import { StatCard } from "../../../shared/ui/stat-card";
import { Textarea } from "../../../shared/ui/textarea";
import { useFournisseur } from "../context/fournisseurContextCore";
import { formatDate, formatMoney } from "../lib/format";
import { COMMANDE_STATUS } from "../lib/commerceStatus";

const PAGE_SIZE = 10;

type Tab = "commandes" | "fournisseurs";

interface LigneAchatForm {
  produit: string;
  unite: string;
  quantite: string;
  prix_achat_unitaire: string;
}

const EMPTY_LIGNE: LigneAchatForm = {
  produit: "",
  unite: "",
  quantite: "1",
  prix_achat_unitaire: "",
};

export function AchatsPage() {
  const commandes = useAllPages(getAllCommandesAchat);
  const fournisseurs = useAllPages(getAllFournisseursMarchandises);
  const produits = useAllPages(getAllProduits);
  const { abonnement } = useFournisseur();

  const [tab, setTab] = useState<Tab>("commandes");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [page, setPage] = useState(1);

  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [commandeModalOpen, setCommandeModalOpen] = useState(false);
  const [commandeFournisseur, setCommandeFournisseur] = useState("");
  const [commandeNotes, setCommandeNotes] = useState("");
  const [commandeLignes, setCommandeLignes] = useState<LigneAchatForm[]>([EMPTY_LIGNE]);
  const [commandeSaving, setCommandeSaving] = useState(false);

  const [receptionCommande, setReceptionCommande] = useState<CommandeAchat | null>(null);
  const [receptionLignes, setReceptionLignes] = useState<Record<number, string>>({});
  const [receptionNotes, setReceptionNotes] = useState("");
  const [receptionSaving, setReceptionSaving] = useState(false);

  const [receptionsCommande, setReceptionsCommande] = useState<CommandeAchat | null>(null);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [receptionsLoading, setReceptionsLoading] = useState(false);

  const [annulerTarget, setAnnulerTarget] = useState<CommandeAchat | null>(null);
  const [annulerLoading, setAnnulerLoading] = useState(false);

  const [fournisseurModalOpen, setFournisseurModalOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] =
    useState<FournisseurMarchandise | null>(null);
  const [fournisseurForm, setFournisseurForm] = useState({
    nom: "",
    telephone: "",
    adresse: "",
    notes: "",
    actif: true,
  });
  const [fournisseurSaving, setFournisseurSaving] = useState(false);

  const commandeItems = useMemo(() => commandes.data?.items ?? [], [commandes.data]);
  const fournisseurItems = useMemo(
    () => fournisseurs.data?.items ?? [],
    [fournisseurs.data],
  );
  const produitItems = useMemo(() => produits.data?.items ?? [], [produits.data]);
  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? "FCFA";
  const canWrite = Boolean(abonnement?.est_actif);

  const refreshAll = () => {
    commandes.refetch();
    fournisseurs.refetch();
    produits.refetch();
  };

  const filteredCommandes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return commandeItems.filter((commande) => {
      if (statutFilter !== "TOUS" && commande.statut !== statutFilter) return false;
      if (!term) return true;

      return (
        commande.reference.toLowerCase().includes(term) ||
        commande.fournisseur_marchandise_nom.toLowerCase().includes(term)
      );
    });
  }, [commandeItems, search, statutFilter]);

  const filteredFournisseurs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return fournisseurItems;
    return fournisseurItems.filter(
      (fournisseur) =>
        fournisseur.nom.toLowerCase().includes(term) ||
        fournisseur.telephone.toLowerCase().includes(term),
    );
  }, [fournisseurItems, search]);

  const activeItems: (CommandeAchat | FournisseurMarchandise)[] =
    tab === "commandes" ? filteredCommandes : filteredFournisseurs;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = activeItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const commandesEnCours = commandeItems.filter(
    (commande) =>
      commande.statut === "COMMANDEE" || commande.statut === "PARTIELLEMENT_RECUE",
  ).length;
  const montantEnCours = commandeItems
    .filter(
      (commande) =>
        commande.statut === "COMMANDEE" || commande.statut === "PARTIELLEMENT_RECUE",
    )
    .reduce((total, commande) => total + Number(commande.montant_total), 0);

  const resetLigne = (produitId: string): LigneAchatForm => {
    const produit = produitItems.find((item) => String(item.id) === produitId);
    const base = produit?.unites.find((unite) => unite.est_base) ?? produit?.unites[0];

    return {
      produit: produitId,
      unite: base ? String(base.id) : "",
      quantite: "1",
      prix_achat_unitaire: produit?.prix_achat ?? "",
    };
  };

  const openCreateCommande = () => {
    setCommandeFournisseur("");
    setCommandeNotes("");
    setCommandeLignes([EMPTY_LIGNE]);
    setCommandeModalOpen(true);
  };

  const handleSaveCommande = async () => {
    const lignesValides = commandeLignes.filter(
      (ligne) => ligne.produit && ligne.unite && Number(ligne.quantite) > 0,
    );

    if (!commandeFournisseur) {
      setActionError("Sélectionnez un fournisseur de marchandises.");
      return;
    }
    if (lignesValides.length === 0) {
      setActionError(
        "Ajoutez au moins une ligne valide avec un produit, une unité et une quantité.",
      );
      return;
    }

    setCommandeSaving(true);
    setActionError(null);
    setSuccess(null);

    try {
      const commande = await createCommandeAchat({
        fournisseur_marchandise: Number(commandeFournisseur),
        notes: commandeNotes.trim(),
        lignes: lignesValides.map((ligne) => ({
          produit: Number(ligne.produit),
          unite: Number(ligne.unite),
          quantite: ligne.quantite,
          prix_achat_unitaire: ligne.prix_achat_unitaire || undefined,
        })),
      });
      setSuccess(`La commande ${commande.reference} a été créée.`);
      setCommandeModalOpen(false);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setCommandeSaving(false);
    }
  };

  const openReception = (commande: CommandeAchat) => {
    const valeurs: Record<number, string> = {};

    for (const ligne of commande.lignes) {
      const facteur = Number(ligne.unite_facteur) || 1;
      const restantBase =
        Number(ligne.quantite_base) - Number(ligne.quantite_recue_base);
      valeurs[ligne.id] =
        facteur > 0 ? String(Number((restantBase / facteur).toFixed(3))) : "0";
    }

    setReceptionLignes(valeurs);
    setReceptionNotes("");
    setReceptionCommande(commande);
  };

  const handleReceptionner = async () => {
    if (!receptionCommande) return;
    setReceptionSaving(true);
    setActionError(null);
    setSuccess(null);

    try {
      const reception = await receptionnerCommande(receptionCommande.id, {
        notes: receptionNotes.trim(),
        lignes: Object.entries(receptionLignes)
          .filter(([, quantite]) => Number(quantite) > 0)
          .map(([ligneId, quantite]) => ({
            ligne_commande: Number(ligneId),
            quantite,
          })),
      });
      setSuccess(`La réception ${reception.reference} a été enregistrée.`);
      setReceptionCommande(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setReceptionSaving(false);
    }
  };

  const openReceptions = async (commande: CommandeAchat) => {
    setReceptionsCommande(commande);
    setReceptions([]);
    setReceptionsLoading(true);

    try {
      const result = await getCommandeReceptions(commande.id);
      setReceptions(result.items);
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setReceptionsLoading(false);
    }
  };

  const handleAnnuler = async () => {
    if (!annulerTarget) return;
    setAnnulerLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await annulerCommande(annulerTarget.id);
      setSuccess(`La commande ${annulerTarget.reference} a été annulée.`);
      setAnnulerTarget(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setAnnulerLoading(false);
    }
  };

  const openCreateFournisseur = () => {
    setEditingFournisseur(null);
    setFournisseurForm({
      nom: "",
      telephone: "",
      adresse: "",
      notes: "",
      actif: true,
    });
    setFournisseurModalOpen(true);
  };

  const openEditFournisseur = (fournisseur: FournisseurMarchandise) => {
    setEditingFournisseur(fournisseur);
    setFournisseurForm({
      nom: fournisseur.nom,
      telephone: fournisseur.telephone,
      adresse: fournisseur.adresse,
      notes: fournisseur.notes,
      actif: fournisseur.actif,
    });
    setFournisseurModalOpen(true);
  };

  const handleSaveFournisseur = async () => {
    setFournisseurSaving(true);
    setActionError(null);
    setSuccess(null);

    const payload = {
      nom: fournisseurForm.nom.trim(),
      telephone: fournisseurForm.telephone.trim(),
      adresse: fournisseurForm.adresse.trim(),
      notes: fournisseurForm.notes.trim(),
      actif: fournisseurForm.actif,
    };

    try {
      if (editingFournisseur) {
        await updateFournisseurMarchandise(editingFournisseur.id, payload);
        setSuccess(`Le fournisseur « ${payload.nom} » a été mis à jour.`);
      } else {
        await createFournisseurMarchandise(payload);
        setSuccess(`Le fournisseur « ${payload.nom} » a été créé.`);
      }
      setFournisseurModalOpen(false);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setFournisseurSaving(false);
    }
  };

  const loading = commandes.loading || fournisseurs.loading || produits.loading;
  const error = commandes.error ?? fournisseurs.error ?? produits.error;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Achats et réceptions"
          description="Passez vos commandes et suivez les réceptions de marchandises."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-border bg-white"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={7} columns={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshAll} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achats et réceptions"
        description="Passez vos commandes et suivez les réceptions de marchandises."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button
              type="button"
              onClick={openCreateCommande}
              disabled={!canWrite || fournisseurItems.length === 0}
            >
              <Plus className="h-4 w-4" />
              Nouvelle commande
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          La consultation reste disponible, mais les achats sont désactivés.
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Commandes"
          value={commandeItems.length}
          hint={`${commandesEnCours} en cours`}
          icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Montant en cours"
          value={formatMoney(montantEnCours, devise)}
          hint="Commandes à recevoir"
          icon={<Truck className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Fournisseurs de marchandises"
          value={fournisseurItems.length}
          hint="Partenaires d'approvisionnement"
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
          tone="neutral"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 pt-4">
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-1">
            {(
              [
                { key: "commandes", label: `Commandes (${commandeItems.length})` },
                {
                  key: "fournisseurs",
                  label: `Fournisseurs (${fournisseurItems.length})`,
                },
              ] as { key: Tab; label: string }[]
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                  setPage(1);
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === item.key
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 border-b border-border px-4 py-4 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={
                tab === "commandes"
                  ? "Référence ou fournisseur..."
                  : "Nom ou téléphone..."
              }
              className="pl-9"
              aria-label="Rechercher"
            />
          </div>

          {tab === "commandes" ? (
            <Select
              value={statutFilter}
              onChange={(event) => {
                setStatutFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filtrer par statut"
              className="sm:w-56"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="COMMANDEE">Commandées</option>
              <option value="PARTIELLEMENT_RECUE">Partiellement reçues</option>
              <option value="RECUE">Reçues</option>
              <option value="ANNULEE">Annulées</option>
            </Select>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={openCreateFournisseur}
              disabled={!canWrite}
            >
              <Plus className="h-4 w-4" />
              Nouveau fournisseur
            </Button>
          )}
        </div>

        {tab === "commandes" ? (
          pageItems.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucune commande"
                description={
                  fournisseurItems.length === 0
                    ? "Ajoutez d'abord un fournisseur de marchandises pour passer une commande."
                    : "Vos commandes d'approvisionnement apparaîtront ici."
                }
                icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
                action={
                  canWrite && fournisseurItems.length > 0 ? (
                    <Button type="button" onClick={openCreateCommande}>
                      <Plus className="h-4 w-4" />
                      Nouvelle commande
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Référence</th>
                    <th className="px-5 py-3 font-medium">Fournisseur</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((item) => {
                    const commande = item as CommandeAchat;
                    const config = COMMANDE_STATUS[commande.statut];
                    const canReceptionner =
                      commande.statut === "COMMANDEE" ||
                      commande.statut === "PARTIELLEMENT_RECUE";
                    const canAnnuler =
                      commande.statut !== "RECUE" && commande.statut !== "ANNULEE";

                    return (
                      <tr
                        key={commande.id}
                        className="transition-colors hover:bg-surface/60"
                      >
                        <td className="px-5 py-3 font-medium text-ink">
                          {commande.reference}
                        </td>
                        <td className="px-5 py-3 text-muted">
                          {commande.fournisseur_marchandise_nom}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                          {formatMoney(commande.montant_total, devise)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted">
                          {formatDate(commande.date_commande)}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={config.tone}>{config.label}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            {canReceptionner && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={!canWrite}
                                onClick={() => openReception(commande)}
                              >
                                <PackageCheck className="h-4 w-4" />
                                Réceptionner
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openReceptions(commande)}
                            >
                              <Truck className="h-4 w-4" />
                              Réceptions
                            </Button>
                            {canAnnuler && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={!canWrite}
                                onClick={() => setAnnulerTarget(commande)}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : pageItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Aucun fournisseur"
              description="Enregistrez vos grossistes pour passer des commandes d'achat."
              icon={<Building2 className="h-5 w-5" aria-hidden="true" />}
              action={
                canWrite ? (
                  <Button type="button" onClick={openCreateFournisseur}>
                    <Plus className="h-4 w-4" />
                    Nouveau fournisseur
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Fournisseur</th>
                  <th className="px-5 py-3 font-medium">Téléphone</th>
                  <th className="px-5 py-3 font-medium">Adresse</th>
                  <th className="px-5 py-3 font-medium">État</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((item) => {
                  const fournisseur = item as FournisseurMarchandise;
                  return (
                    <tr
                      key={fournisseur.id}
                      className="transition-colors hover:bg-surface/60"
                    >
                      <td className="px-5 py-3 font-medium text-ink">
                        {fournisseur.nom}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {fournisseur.telephone || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {fournisseur.adresse || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={fournisseur.actif ? "success" : "neutral"}>
                          {fournisseur.actif ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canWrite}
                            onClick={() => openEditFournisseur(fournisseur)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={activeItems.length}
          pageSize={PAGE_SIZE}
          itemLabel={tab === "commandes" ? "commandes" : "fournisseurs"}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={commandeModalOpen}
        onClose={() => setCommandeModalOpen(false)}
        title="Nouvelle commande d'achat"
        description="Ajoutez les produits et quantités à commander."
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="commande-fournisseur" className="block text-sm font-medium text-ink">
                Fournisseur de marchandises
              </label>
              <Select
                id="commande-fournisseur"
                value={commandeFournisseur}
                onChange={(event) => setCommandeFournisseur(event.target.value)}
                className="mt-1"
              >
                <option value="">Sélectionner...</option>
                {fournisseurItems.map((fournisseur) => (
                  <option key={fournisseur.id} value={fournisseur.id}>
                    {fournisseur.nom}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="commande-notes" className="block text-sm font-medium text-ink">
                Notes
              </label>
              <Input
                id="commande-notes"
                value={commandeNotes}
                onChange={(event) => setCommandeNotes(event.target.value)}
                className="mt-1"
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Lignes de commande</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCommandeLignes((lignes) => [...lignes, EMPTY_LIGNE])}
              >
                <Plus className="h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>

            {commandeLignes.map((ligne, index) => {
              const produit = produitItems.find(
                (item) => String(item.id) === ligne.produit,
              );
              const unites = produit?.unites ?? [];

              return (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                >
                  <Select
                    value={ligne.produit}
                    onChange={(event) =>
                      setCommandeLignes((lignes) =>
                        lignes.map((item, itemIndex) =>
                          itemIndex === index
                            ? resetLigne(event.target.value)
                            : item,
                        ),
                      )
                    }
                    aria-label="Produit"
                  >
                    <option value="">Produit...</option>
                    {produitItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nom}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={ligne.unite}
                    onChange={(event) =>
                      setCommandeLignes((lignes) =>
                        lignes.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, unite: event.target.value }
                            : item,
                        ),
                      )
                    }
                    aria-label="Unité"
                    disabled={unites.length === 0}
                  >
                    <option value="">Unité...</option>
                    {unites.map((unite) => (
                      <option key={unite.id} value={unite.id}>
                        {unite.nom}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={ligne.quantite}
                    onChange={(event) =>
                      setCommandeLignes((lignes) =>
                        lignes.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, quantite: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Quantité"
                    aria-label="Quantité"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ligne.prix_achat_unitaire}
                    onChange={(event) =>
                      setCommandeLignes((lignes) =>
                        lignes.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, prix_achat_unitaire: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Prix d'achat"
                    aria-label="Prix d'achat unitaire"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={commandeLignes.length === 1}
                    onClick={() =>
                      setCommandeLignes((lignes) =>
                        lignes.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommandeModalOpen(false)}
              disabled={commandeSaving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveCommande}
              disabled={commandeSaving || !commandeFournisseur}
            >
              {commandeSaving ? "Création..." : "Créer la commande"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(receptionCommande)}
        onClose={() => setReceptionCommande(null)}
        title="Réceptionner la commande"
        description={receptionCommande?.reference}
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Produit</th>
                  <th className="px-4 py-2 font-medium">Commandé</th>
                  <th className="px-4 py-2 font-medium">Déjà reçu</th>
                  <th className="px-4 py-2 font-medium">À recevoir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(receptionCommande?.lignes ?? []).map((ligne) => (
                  <tr key={ligne.id}>
                    <td className="px-4 py-2">
                      <p className="font-medium text-ink">{ligne.produit_nom}</p>
                      <p className="text-xs text-muted">{ligne.unite_nom}</p>
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {ligne.quantite} {ligne.unite_nom}
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {Number(
                        (
                          Number(ligne.quantite_recue_base) /
                          (Number(ligne.unite_facteur) || 1)
                        ).toFixed(3),
                      )}{" "}
                      {ligne.unite_nom}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          value={receptionLignes[ligne.id] ?? "0"}
                          onChange={(event) =>
                            setReceptionLignes((valeurs) => ({
                              ...valeurs,
                              [ligne.id]: event.target.value,
                            }))
                          }
                          aria-label={`Quantité reçue pour ${ligne.produit_nom}`}
                        />
                        <span className="whitespace-nowrap text-xs text-muted">
                          {ligne.unite_nom}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <label htmlFor="reception-notes" className="block text-sm font-medium text-ink">
              Notes
            </label>
            <Textarea
              id="reception-notes"
              value={receptionNotes}
              onChange={(event) => setReceptionNotes(event.target.value)}
              className="mt-1"
              placeholder="Optionnel"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setReceptionCommande(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleReceptionner}
              disabled={
                receptionSaving ||
                Object.values(receptionLignes).every((valeur) => Number(valeur) <= 0)
              }
            >
              {receptionSaving ? "Enregistrement..." : "Enregistrer la réception"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(receptionsCommande)}
        onClose={() => setReceptionsCommande(null)}
        title="Réceptions"
        description={receptionsCommande?.reference}
        size="lg"
      >
        {receptionsLoading ? (
          <TableSkeleton rows={4} columns={4} />
        ) : receptions.length === 0 ? (
          <EmptyState
            title="Aucune réception"
            description="Les réceptions de cette commande apparaîtront ici."
            icon={<PackageCheck className="h-5 w-5" aria-hidden="true" />}
          />
        ) : (
          <div className="space-y-3">
            {receptions.map((reception) => (
              <div key={reception.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{reception.reference}</p>
                  <p className="text-xs text-muted">
                    {formatDate(reception.date_reception, true)}
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {reception.lignes.map((ligne) => (
                    <li key={ligne.id}>
                      {ligne.produit_nom} — {ligne.quantite} {ligne.unite_nom}
                    </li>
                  ))}
                </ul>
                {reception.notes && (
                  <p className="mt-2 text-xs text-muted">{reception.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={fournisseurModalOpen}
        onClose={() => setFournisseurModalOpen(false)}
        title={
          editingFournisseur
            ? "Modifier le fournisseur de marchandises"
            : "Nouveau fournisseur de marchandises"
        }
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="fm-nom" className="block text-sm font-medium text-ink">
              Nom
            </label>
            <Input
              id="fm-nom"
              value={fournisseurForm.nom}
              onChange={(event) =>
                setFournisseurForm((form) => ({ ...form, nom: event.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fm-telephone" className="block text-sm font-medium text-ink">
                Téléphone
              </label>
              <Input
                id="fm-telephone"
                value={fournisseurForm.telephone}
                onChange={(event) =>
                  setFournisseurForm((form) => ({
                    ...form,
                    telephone: event.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="fm-adresse" className="block text-sm font-medium text-ink">
                Adresse
              </label>
              <Input
                id="fm-adresse"
                value={fournisseurForm.adresse}
                onChange={(event) =>
                  setFournisseurForm((form) => ({ ...form, adresse: event.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="fm-notes" className="block text-sm font-medium text-ink">
              Notes
            </label>
            <Textarea
              id="fm-notes"
              value={fournisseurForm.notes}
              onChange={(event) =>
                setFournisseurForm((form) => ({ ...form, notes: event.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="fm-actif"
              type="checkbox"
              checked={fournisseurForm.actif}
              onChange={(event) =>
                setFournisseurForm((form) => ({ ...form, actif: event.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            <label htmlFor="fm-actif" className="text-sm text-ink">
              Fournisseur actif
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFournisseurModalOpen(false)}
              disabled={fournisseurSaving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveFournisseur}
              disabled={fournisseurSaving || !fournisseurForm.nom.trim()}
            >
              {fournisseurSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(annulerTarget)}
        title="Annuler la commande"
        description={`Confirmer l'annulation de la commande ${annulerTarget?.reference ?? ""} ?`}
        confirmLabel="Annuler la commande"
        loading={annulerLoading}
        onConfirm={handleAnnuler}
        onClose={() => setAnnulerTarget(null)}
      />
    </div>
  );
}

export default AchatsPage;
