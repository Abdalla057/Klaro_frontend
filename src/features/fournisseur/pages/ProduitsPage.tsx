import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Layers,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  Truck,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import {
  createCategorie,
  createProduit,
  createProduitUnite,
  deleteCategorie,
  deleteProduit,
  entreeStock,
  getAllCategories,
  getAllMouvementsStock,
  getAllProduits,
  getProduitMouvements,
  getStatistiquesCommerce,
  updateCategorie,
  updateProduit,
} from "../../../services/commerceService";
import type {
  CategorieProduit,
  MouvementStock,
  Produit,
  StatistiquesCommerce,
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
import {
  MOUVEMENT_TYPE,
  stockStatus,
} from "../lib/commerceStatus";

const PAGE_SIZE = 10;

type Tab = "produits" | "categories" | "mouvements";

interface ProduitFormState {
  nom: string;
  categorie: string;
  description: string;
  unite_base: string;
  prix_achat: string;
  prix_vente: string;
  seuil_alerte: string;
  actif: boolean;
}

const EMPTY_PRODUIT: ProduitFormState = {
  nom: "",
  categorie: "",
  description: "",
  unite_base: "unité",
  prix_achat: "0",
  prix_vente: "0",
  seuil_alerte: "0",
  actif: true,
};

interface CategorieFormState {
  nom: string;
  description: string;
  actif: boolean;
}

const EMPTY_CATEGORIE: CategorieFormState = {
  nom: "",
  description: "",
  actif: true,
};

export function ProduitsPage() {
  const produits = useAllPages(getAllProduits);
  const categories = useAllPages(getAllCategories);
  const mouvementsStock = useAllPages(getAllMouvementsStock);
  const { abonnement, refresh } = useFournisseur();

  const [stats, setStats] = useState<StatistiquesCommerce | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsKey, setStatsKey] = useState(0);

  const [tab, setTab] = useState<Tab>("produits");
  const [search, setSearch] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("TOUTES");
  const [actifFilter, setActifFilter] = useState("TOUS");
  const [page, setPage] = useState(1);

  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [produitModalOpen, setProduitModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [produitForm, setProduitForm] = useState<ProduitFormState>(EMPTY_PRODUIT);
  const [produitSaving, setProduitSaving] = useState(false);

  const [deletingProduit, setDeletingProduit] = useState<Produit | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [stockProduit, setStockProduit] = useState<Produit | null>(null);
  const [stockQuantite, setStockQuantite] = useState("");
  const [stockMotif, setStockMotif] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  const [unitesProduit, setUnitesProduit] = useState<Produit | null>(null);
  const [uniteForm, setUniteForm] = useState({
    nom: "",
    symbole: "",
    facteur_conversion: "1",
    prix_vente: "",
    est_base: false,
  });
  const [uniteSaving, setUniteSaving] = useState(false);

  const [mouvementsProduit, setMouvementsProduit] = useState<Produit | null>(null);
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [mouvementsLoading, setMouvementsLoading] = useState(false);

  const [categorieModalOpen, setCategorieModalOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<CategorieProduit | null>(null);
  const [categorieForm, setCategorieForm] = useState<CategorieFormState>(EMPTY_CATEGORIE);
  const [categorieSaving, setCategorieSaving] = useState(false);
  const [deletingCategorie, setDeletingCategorie] = useState<CategorieProduit | null>(null);

  useEffect(() => {
    let cancelled = false;

    getStatistiquesCommerce()
      .then((value) => {
        if (cancelled) return;
        setStats(value);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statsKey]);

  const produitItems = useMemo(() => produits.data?.items ?? [], [produits.data]);
  const categorieItems = useMemo(() => categories.data?.items ?? [], [categories.data]);
  const mouvementItems = useMemo(
    () => mouvementsStock.data?.items ?? [],
    [mouvementsStock.data],
  );
  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? "FCFA";
  const canWrite = Boolean(abonnement?.est_actif);

  const refreshAll = () => {
    produits.refetch();
    categories.refetch();
    mouvementsStock.refetch();
    setStatsLoading(true);
    setStatsKey((key) => key + 1);
    refresh();
  };

  const filteredProduits = useMemo(() => {
    const term = search.trim().toLowerCase();

    return produitItems.filter((produit) => {
      if (categorieFilter !== "TOUTES" && String(produit.categorie) !== categorieFilter) {
        return false;
      }
      if (actifFilter === "ACTIFS" && !produit.actif) return false;
      if (actifFilter === "INACTIFS" && produit.actif) return false;
      if (!term) return true;

      return (
        produit.nom.toLowerCase().includes(term) ||
        produit.reference.toLowerCase().includes(term) ||
        (produit.categorie_nom ?? "").toLowerCase().includes(term)
      );
    });
  }, [produitItems, search, categorieFilter, actifFilter]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categorieItems;
    return categorieItems.filter(
      (categorie) =>
        categorie.nom.toLowerCase().includes(term) ||
        categorie.description.toLowerCase().includes(term),
    );
  }, [categorieItems, search]);

  const activeItems: (Produit | CategorieProduit)[] =
    tab === "produits" ? filteredProduits : filteredCategories;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = activeItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const mouvementsTotalPages = Math.max(
    1,
    Math.ceil(mouvementItems.length / PAGE_SIZE),
  );
  const mouvementsCurrentPage = Math.min(page, mouvementsTotalPages);
  const mouvementsPageItems = mouvementItems.slice(
    (mouvementsCurrentPage - 1) * PAGE_SIZE,
    mouvementsCurrentPage * PAGE_SIZE,
  );

  const openCreateProduit = () => {
    setEditingProduit(null);
    setProduitForm(EMPTY_PRODUIT);
    setProduitModalOpen(true);
  };

  const openEditProduit = (produit: Produit) => {
    setEditingProduit(produit);
    setProduitForm({
      nom: produit.nom,
      categorie: produit.categorie ? String(produit.categorie) : "",
      description: produit.description,
      unite_base: produit.unite_base,
      prix_achat: produit.prix_achat,
      prix_vente: produit.prix_vente,
      seuil_alerte: produit.seuil_alerte,
      actif: produit.actif,
    });
    setProduitModalOpen(true);
  };

  const handleSaveProduit = async () => {
    setProduitSaving(true);
    setActionError(null);
    setSuccess(null);

    const payload = {
      nom: produitForm.nom.trim(),
      categorie: produitForm.categorie ? Number(produitForm.categorie) : null,
      description: produitForm.description.trim(),
      unite_base: produitForm.unite_base.trim() || "unité",
      prix_achat: produitForm.prix_achat || "0",
      prix_vente: produitForm.prix_vente || "0",
      seuil_alerte: produitForm.seuil_alerte || "0",
      actif: produitForm.actif,
    };

    try {
      if (editingProduit) {
        await updateProduit(editingProduit.id, payload);
        setSuccess(`Le produit « ${payload.nom} » a été mis à jour.`);
      } else {
        await createProduit(payload);
        setSuccess(`Le produit « ${payload.nom} » a été créé.`);
      }
      setProduitModalOpen(false);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setProduitSaving(false);
    }
  };

  const handleDeleteProduit = async () => {
    if (!deletingProduit) return;
    setDeleteLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await deleteProduit(deletingProduit.id);
      setSuccess(`Le produit « ${deletingProduit.nom} » a été supprimé.`);
      setDeletingProduit(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEntreeStock = async () => {
    if (!stockProduit) return;
    setStockSaving(true);
    setActionError(null);
    setSuccess(null);

    try {
      await entreeStock(stockProduit.id, {
        quantite: stockQuantite,
        motif: stockMotif.trim(),
      });
      setSuccess(`Entrée de stock enregistrée pour « ${stockProduit.nom} ».`);
      setStockProduit(null);
      setStockQuantite("");
      setStockMotif("");
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setStockSaving(false);
    }
  };

  const handleAddUnite = async () => {
    if (!unitesProduit) return;
    setUniteSaving(true);
    setActionError(null);
    setSuccess(null);

    try {
      const unite = await createProduitUnite(unitesProduit.id, {
        nom: uniteForm.nom.trim(),
        symbole: uniteForm.symbole.trim(),
        facteur_conversion: uniteForm.facteur_conversion || "1",
        prix_vente: uniteForm.prix_vente || null,
        est_base: uniteForm.est_base,
      });
      setUnitesProduit((produit) =>
        produit
          ? { ...produit, unites: [...produit.unites, unite] }
          : produit,
      );
      produits.refetch();
      setSuccess(`Unité ajoutée au produit « ${unitesProduit.nom} ».`);
      setUniteForm({
        nom: "",
        symbole: "",
        facteur_conversion: "1",
        prix_vente: "",
        est_base: false,
      });
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setUniteSaving(false);
    }
  };

  const openMouvements = async (produit: Produit) => {
    setMouvementsProduit(produit);
    setMouvements([]);
    setMouvementsLoading(true);

    try {
      const result = await getProduitMouvements(produit.id);
      setMouvements(result.items);
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setMouvementsLoading(false);
    }
  };

  const openCreateCategorie = () => {
    setEditingCategorie(null);
    setCategorieForm(EMPTY_CATEGORIE);
    setCategorieModalOpen(true);
  };

  const openEditCategorie = (categorie: CategorieProduit) => {
    setEditingCategorie(categorie);
    setCategorieForm({
      nom: categorie.nom,
      description: categorie.description,
      actif: categorie.actif,
    });
    setCategorieModalOpen(true);
  };

  const handleSaveCategorie = async () => {
    setCategorieSaving(true);
    setActionError(null);
    setSuccess(null);

    const payload = {
      nom: categorieForm.nom.trim(),
      description: categorieForm.description.trim(),
      actif: categorieForm.actif,
    };

    try {
      if (editingCategorie) {
        await updateCategorie(editingCategorie.id, payload);
        setSuccess(`La catégorie « ${payload.nom} » a été mise à jour.`);
      } else {
        await createCategorie(payload);
        setSuccess(`La catégorie « ${payload.nom} » a été créée.`);
      }
      setCategorieModalOpen(false);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setCategorieSaving(false);
    }
  };

  const handleDeleteCategorie = async () => {
    if (!deletingCategorie) return;
    setDeleteLoading(true);
    setActionError(null);
    setSuccess(null);

    try {
      await deleteCategorie(deletingCategorie.id);
      setSuccess(`La catégorie « ${deletingCategorie.nom} » a été supprimée.`);
      setDeletingCategorie(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const loading = produits.loading || categories.loading;
  const error = produits.error ?? categories.error;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Produits et stock"
          description="Gérez votre catalogue, vos unités de vente et vos mouvements de stock."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
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
        title="Produits et stock"
        description="Gérez votre catalogue, vos unités de vente et vos mouvements de stock."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button type="button" onClick={openCreateProduit} disabled={!canWrite}>
              <Plus className="h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          La consultation reste disponible, mais la création et la modification sont
          désactivées.
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Produits"
          value={statsLoading ? "—" : (stats?.produits.total ?? 0)}
          hint={`${stats?.produits.actifs ?? 0} produit(s) actif(s)`}
          icon={<Package className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Stock faible"
          value={statsLoading ? "—" : (stats?.produits.en_alerte ?? 0)}
          hint="Produits sous le seuil d'alerte"
          icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          tone="warning"
        />
        <StatCard
          label="Ruptures"
          value={statsLoading ? "—" : (stats?.produits.en_rupture ?? 0)}
          hint="Produits à réapprovisionner"
          icon={<Boxes className="h-4 w-4" aria-hidden="true" />}
          tone="danger"
        />
        <StatCard
          label="Catégories"
          value={categorieItems.length}
          hint="Classement du catalogue"
          icon={<Tags className="h-4 w-4" aria-hidden="true" />}
          tone="neutral"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 pt-4">
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-1">
            {(
              [
                { key: "produits", label: `Produits (${produitItems.length})` },
                { key: "categories", label: `Catégories (${categorieItems.length})` },
                { key: "mouvements", label: "Mouvements" },
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

        {tab !== "mouvements" && (
          <div className="grid gap-3 border-b border-border px-4 py-4 sm:grid-cols-[1fr_auto_auto]">
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
                  tab === "produits"
                    ? "Nom, référence ou catégorie..."
                    : "Nom ou description..."
                }
                className="pl-9"
                aria-label="Rechercher"
              />
            </div>

            {tab === "produits" ? (
              <>
                <Select
                  value={categorieFilter}
                  onChange={(event) => {
                    setCategorieFilter(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filtrer par catégorie"
                  className="sm:w-48"
                >
                  <option value="TOUTES">Toutes les catégories</option>
                  {categorieItems.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </option>
                  ))}
                </Select>
                <Select
                  value={actifFilter}
                  onChange={(event) => {
                    setActifFilter(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filtrer par état"
                  className="sm:w-40"
                >
                  <option value="TOUS">Tous</option>
                  <option value="ACTIFS">Actifs</option>
                  <option value="INACTIFS">Inactifs</option>
                </Select>
              </>
            ) : (
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCreateCategorie}
                  disabled={!canWrite}
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle catégorie
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "produits" ? (
          pageItems.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucun produit"
                description="Créez votre premier produit pour commencer à vendre et suivre votre stock."
                icon={<Package className="h-5 w-5" aria-hidden="true" />}
                action={
                  canWrite ? (
                    <Button type="button" onClick={openCreateProduit}>
                      <Plus className="h-4 w-4" />
                      Nouveau produit
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
                    <th className="px-5 py-3 font-medium">Produit</th>
                    <th className="px-5 py-3 font-medium">Catégorie</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Prix de vente</th>
                    <th className="px-5 py-3 font-medium">État</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((item) => {
                    const produit = item as Produit;
                    const etat = stockStatus(produit);

                    return (
                      <tr
                        key={produit.id}
                        className="transition-colors hover:bg-surface/60"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{produit.nom}</p>
                          <p className="text-xs text-muted">{produit.reference}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted">
                          {produit.categorie_nom ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-ink">
                          {produit.stock_actuel} {produit.unite_base}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                          {formatMoney(produit.prix_vente, devise)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            <Badge tone={etat.tone}>{etat.label}</Badge>
                            {!produit.actif && (
                              <span className="text-[11px] text-muted">Inactif</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openMouvements(produit)}
                            >
                              <Layers className="h-4 w-4" />
                              Mouvements
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setUnitesProduit(produit)}
                            >
                              <Boxes className="h-4 w-4" />
                              Unités
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => {
                                setStockQuantite("");
                                setStockMotif("");
                                setStockProduit(produit);
                              }}
                            >
                              <Truck className="h-4 w-4" />
                              Entrée
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => openEditProduit(produit)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => setDeletingProduit(produit)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : tab === "categories" ? (
          pageItems.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Aucune catégorie"
                description="Les catégories permettent de classer vos produits."
                icon={<Tags className="h-5 w-5" aria-hidden="true" />}
                action={
                  canWrite ? (
                    <Button type="button" onClick={openCreateCategorie}>
                      <Plus className="h-4 w-4" />
                      Nouvelle catégorie
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
                    <th className="px-5 py-3 font-medium">Catégorie</th>
                    <th className="px-5 py-3 font-medium">Description</th>
                    <th className="px-5 py-3 font-medium">État</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((item) => {
                    const categorie = item as CategorieProduit;
                    return (
                      <tr
                        key={categorie.id}
                        className="transition-colors hover:bg-surface/60"
                      >
                        <td className="px-5 py-3 font-medium text-ink">{categorie.nom}</td>
                        <td className="max-w-sm px-5 py-3 text-muted">
                          {categorie.description || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={categorie.actif ? "success" : "neutral"}>
                            {categorie.actif ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => openEditCategorie(categorie)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => setDeletingCategorie(categorie)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : mouvementsPageItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Aucun mouvement"
              description="Les entrées, sorties et ajustements de stock apparaîtront ici."
              icon={<Layers className="h-5 w-5" aria-hidden="true" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Produit</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Quantité</th>
                  <th className="px-5 py-3 font-medium">Stock après</th>
                  <th className="px-5 py-3 font-medium">Motif</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mouvementsPageItems.map((mouvement) => {
                  const config = MOUVEMENT_TYPE[mouvement.type_mouvement];
                  return (
                    <tr
                      key={mouvement.id}
                      className="transition-colors hover:bg-surface/60"
                    >
                      <td className="px-5 py-3 font-medium text-ink">
                        {mouvement.produit_nom}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={config.tone}>{config.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {mouvement.quantite_base}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {mouvement.stock_apres}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {mouvement.motif || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(mouvement.date_creation, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "mouvements" ? (
          <Pagination
            page={mouvementsCurrentPage}
            totalPages={mouvementsTotalPages}
            totalItems={mouvementItems.length}
            pageSize={PAGE_SIZE}
            itemLabel="mouvements"
            onPageChange={setPage}
          />
        ) : (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={activeItems.length}
            pageSize={PAGE_SIZE}
            itemLabel={tab === "produits" ? "produits" : "catégories"}
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal
        open={produitModalOpen}
        onClose={() => setProduitModalOpen(false)}
        title={editingProduit ? "Modifier le produit" : "Nouveau produit"}
        description="Les prix et le seuil sont exprimés dans votre devise."
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="produit-nom" className="block text-sm font-medium text-ink">
                Nom du produit
              </label>
              <Input
                id="produit-nom"
                value={produitForm.nom}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, nom: event.target.value }))
                }
                className="mt-1"
                placeholder="Ex. Sac de riz 25 kg"
              />
            </div>
            <div>
              <label htmlFor="produit-categorie" className="block text-sm font-medium text-ink">
                Catégorie
              </label>
              <Select
                id="produit-categorie"
                value={produitForm.categorie}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, categorie: event.target.value }))
                }
                className="mt-1"
              >
                <option value="">Sans catégorie</option>
                {categorieItems.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.nom}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="produit-unite" className="block text-sm font-medium text-ink">
                Unité de base
              </label>
              <Input
                id="produit-unite"
                value={produitForm.unite_base}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, unite_base: event.target.value }))
                }
                className="mt-1"
                placeholder="Ex. sac, pièce, kg"
              />
            </div>
            <div>
              <label htmlFor="produit-prix-achat" className="block text-sm font-medium text-ink">
                Prix d'achat
              </label>
              <Input
                id="produit-prix-achat"
                type="number"
                min="0"
                step="0.01"
                value={produitForm.prix_achat}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, prix_achat: event.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="produit-prix-vente" className="block text-sm font-medium text-ink">
                Prix de vente
              </label>
              <Input
                id="produit-prix-vente"
                type="number"
                min="0"
                step="0.01"
                value={produitForm.prix_vente}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, prix_vente: event.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="produit-seuil" className="block text-sm font-medium text-ink">
                Seuil d'alerte
              </label>
              <Input
                id="produit-seuil"
                type="number"
                min="0"
                step="0.01"
                value={produitForm.seuil_alerte}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, seuil_alerte: event.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="produit-actif"
                type="checkbox"
                checked={produitForm.actif}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, actif: event.target.checked }))
                }
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <label htmlFor="produit-actif" className="text-sm text-ink">
                Produit actif
              </label>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="produit-description" className="block text-sm font-medium text-ink">
                Description
              </label>
              <Textarea
                id="produit-description"
                value={produitForm.description}
                onChange={(event) =>
                  setProduitForm((form) => ({ ...form, description: event.target.value }))
                }
                className="mt-1"
                placeholder="Informations complémentaires..."
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProduitModalOpen(false)}
              disabled={produitSaving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveProduit}
              disabled={produitSaving || !produitForm.nom.trim()}
            >
              {produitSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(stockProduit)}
        onClose={() => setStockProduit(null)}
        title="Entrée de stock"
        description={
          stockProduit
            ? `${stockProduit.nom} · stock actuel ${stockProduit.stock_actuel} ${stockProduit.unite_base}`
            : undefined
        }
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="stock-quantite" className="block text-sm font-medium text-ink">
              Quantité à ajouter
            </label>
            <Input
              id="stock-quantite"
              type="number"
              min="0.001"
              step="0.001"
              value={stockQuantite}
              onChange={(event) => setStockQuantite(event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="stock-motif" className="block text-sm font-medium text-ink">
              Motif
            </label>
            <Input
              id="stock-motif"
              value={stockMotif}
              onChange={(event) => setStockMotif(event.target.value)}
              className="mt-1"
              placeholder="Ex. réapprovisionnement"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setStockProduit(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleEntreeStock}
              disabled={stockSaving || Number(stockQuantite) <= 0}
            >
              {stockSaving ? "Enregistrement..." : "Ajouter au stock"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(unitesProduit)}
        onClose={() => setUnitesProduit(null)}
        title="Unités de vente"
        description={
          unitesProduit
            ? `${unitesProduit.nom} · unité de base : ${unitesProduit.unite_base}`
            : undefined
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Unité</th>
                  <th className="px-4 py-2 font-medium">Facteur</th>
                  <th className="px-4 py-2 font-medium">Prix</th>
                  <th className="px-4 py-2 font-medium">Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(unitesProduit?.unites ?? []).map((unite) => (
                  <tr key={unite.id}>
                    <td className="px-4 py-2 font-medium text-ink">
                      {unite.nom} {unite.symbole && `(${unite.symbole})`}
                    </td>
                    <td className="px-4 py-2 text-muted">{unite.facteur_conversion}</td>
                    <td className="px-4 py-2 text-muted">
                      {formatMoney(unite.prix_effectif, devise)}
                    </td>
                    <td className="px-4 py-2">
                      {unite.est_base ? <Badge tone="brand">Base</Badge> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
            <div>
              <label htmlFor="unite-nom" className="block text-sm font-medium text-ink">
                Nom
              </label>
              <Input
                id="unite-nom"
                value={uniteForm.nom}
                onChange={(event) =>
                  setUniteForm((form) => ({ ...form, nom: event.target.value }))
                }
                className="mt-1"
                placeholder="Ex. carton"
              />
            </div>
            <div>
              <label htmlFor="unite-symbole" className="block text-sm font-medium text-ink">
                Symbole
              </label>
              <Input
                id="unite-symbole"
                value={uniteForm.symbole}
                onChange={(event) =>
                  setUniteForm((form) => ({ ...form, symbole: event.target.value }))
                }
                className="mt-1"
                placeholder="Ex. ctn"
              />
            </div>
            <div>
              <label htmlFor="unite-facteur" className="block text-sm font-medium text-ink">
                Facteur de conversion
              </label>
              <Input
                id="unite-facteur"
                type="number"
                min="0.001"
                step="0.001"
                value={uniteForm.facteur_conversion}
                onChange={(event) =>
                  setUniteForm((form) => ({
                    ...form,
                    facteur_conversion: event.target.value,
                  }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="unite-prix" className="block text-sm font-medium text-ink">
                Prix de vente (optionnel)
              </label>
              <Input
                id="unite-prix"
                type="number"
                min="0"
                step="0.01"
                value={uniteForm.prix_vente}
                onChange={(event) =>
                  setUniteForm((form) => ({ ...form, prix_vente: event.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="unite-base"
                type="checkbox"
                checked={uniteForm.est_base}
                onChange={(event) =>
                  setUniteForm((form) => ({ ...form, est_base: event.target.checked }))
                }
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <label htmlFor="unite-base" className="text-sm text-ink">
                Définir comme unité de base
              </label>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="button"
                onClick={handleAddUnite}
                disabled={uniteSaving || !uniteForm.nom.trim()}
              >
                <Plus className="h-4 w-4" />
                {uniteSaving ? "Ajout..." : "Ajouter l'unité"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(mouvementsProduit)}
        onClose={() => setMouvementsProduit(null)}
        title="Mouvements de stock"
        description={mouvementsProduit?.nom}
        size="lg"
      >
        {mouvementsLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : mouvements.length === 0 ? (
          <EmptyState
            title="Aucun mouvement"
            description="Les entrées, sorties et ajustements de ce produit apparaîtront ici."
            icon={<Layers className="h-5 w-5" aria-hidden="true" />}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Quantité</th>
                  <th className="px-4 py-2 font-medium">Stock après</th>
                  <th className="px-4 py-2 font-medium">Motif</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mouvements.map((mouvement) => {
                  const config = MOUVEMENT_TYPE[mouvement.type_mouvement];
                  return (
                    <tr key={mouvement.id}>
                      <td className="px-4 py-2">
                        <Badge tone={config.tone}>{config.label}</Badge>
                      </td>
                      <td className="px-4 py-2 font-medium text-ink">
                        {mouvement.quantite_base}
                      </td>
                      <td className="px-4 py-2 text-muted">{mouvement.stock_apres}</td>
                      <td className="px-4 py-2 text-muted">{mouvement.motif || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-muted">
                        {formatDate(mouvement.date_creation, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal
        open={categorieModalOpen}
        onClose={() => setCategorieModalOpen(false)}
        title={editingCategorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="categorie-nom" className="block text-sm font-medium text-ink">
              Nom
            </label>
            <Input
              id="categorie-nom"
              value={categorieForm.nom}
              onChange={(event) =>
                setCategorieForm((form) => ({ ...form, nom: event.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="categorie-description" className="block text-sm font-medium text-ink">
              Description
            </label>
            <Textarea
              id="categorie-description"
              value={categorieForm.description}
              onChange={(event) =>
                setCategorieForm((form) => ({ ...form, description: event.target.value }))
              }
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="categorie-actif"
              type="checkbox"
              checked={categorieForm.actif}
              onChange={(event) =>
                setCategorieForm((form) => ({ ...form, actif: event.target.checked }))
              }
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            <label htmlFor="categorie-actif" className="text-sm text-ink">
              Catégorie active
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategorieModalOpen(false)}
              disabled={categorieSaving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveCategorie}
              disabled={categorieSaving || !categorieForm.nom.trim()}
            >
              {categorieSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingProduit)}
        title="Supprimer le produit"
        description={`Confirmer la suppression de « ${deletingProduit?.nom ?? ""} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
        onConfirm={handleDeleteProduit}
        onClose={() => setDeletingProduit(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingCategorie)}
        title="Supprimer la catégorie"
        description={`Confirmer la suppression de « ${deletingCategorie?.nom ?? ""} » ? Les produits associés seront détachés.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
        onConfirm={handleDeleteCategorie}
        onClose={() => setDeletingCategorie(null)}
      />
    </div>
  );
}

export default ProduitsPage;
