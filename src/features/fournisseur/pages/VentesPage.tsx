import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import { getAllClients } from "../../../services/clientService";
import {
  ajouterPaiementVente,
  annulerVente,
  createVente,
  getAllProduits,
  getAllVentes,
  getStatistiquesCommerce,
  getVentePaiements,
  ouvrirFacturePdf,
} from "../../../services/commerceService";
import type {
  ModePaiement,
  ModePaiementReel,
  PaiementVente,
  Produit,
  StatistiquesCommerce,
  Vente,
} from "../../../types/commerce";
import type { Client } from "../../../types/fournisseur";
import { Alert } from "../../../shared/ui/alert";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button/button";
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
  MODES_PAIEMENT,
  MODE_PAIEMENT_LABELS,
  VENTE_STATUS,
} from "../lib/commerceStatus";

const PAGE_SIZE = 10;

const formatQuantite = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 }).format(value);

interface LigneVenteForm {
  produit: string;
  unite: string;
  quantite: string;
  prix_unitaire: string;
}

const EMPTY_LIGNE: LigneVenteForm = {
  produit: "",
  unite: "",
  quantite: "1",
  prix_unitaire: "",
};

export function VentesPage() {
  const ventes = useAllPages(getAllVentes);
  const produits = useAllPages(getAllProduits);
  const clients = useAllPages(getAllClients);
  const { abonnement } = useFournisseur();

  const [stats, setStats] = useState<StatistiquesCommerce | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsKey, setStatsKey] = useState(0);

  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [paiementFilter, setPaiementFilter] = useState("TOUS");
  const [page, setPage] = useState(1);

  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [venteModalOpen, setVenteModalOpen] = useState(false);
  const [venteClient, setVenteClient] = useState("");
  const [venteLignes, setVenteLignes] = useState<LigneVenteForm[]>([EMPTY_LIGNE]);
  const [venteMontantPaye, setVenteMontantPaye] = useState("0");
  const [venteModePaiement, setVenteModePaiement] = useState<ModePaiement>("ESPECES");
  const [venteCle, setVenteCle] = useState("");
  const [venteSaving, setVenteSaving] = useState(false);

  const [detailVente, setDetailVente] = useState<Vente | null>(null);
  const [detailPaiements, setDetailPaiements] = useState<PaiementVente[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [paiementVente, setPaiementVente] = useState<Vente | null>(null);
  const [paiementMontant, setPaiementMontant] = useState("");
  const [paiementMode, setPaiementMode] = useState<ModePaiementReel>("ESPECES");
  const [paiementReference, setPaiementReference] = useState("");
  const [paiementCommentaire, setPaiementCommentaire] = useState("");
  const [paiementSaving, setPaiementSaving] = useState(false);

  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

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

  const venteItems = useMemo(() => ventes.data?.items ?? [], [ventes.data]);
  const produitItems = useMemo(() => produits.data?.items ?? [], [produits.data]);
  const clientItems = useMemo(() => clients.data?.items ?? [], [clients.data]);
  const devise = abonnement?.plan?.devise ?? abonnement?.abonnement?.devise ?? "FCFA";
  const canWrite = Boolean(abonnement?.est_actif);

  const produitsDisponibles = useMemo(
    () => produitItems.filter((produit) => Number(produit.stock_actuel) > 0),
    [produitItems],
  );

  const venteTotal = useMemo(
    () =>
      venteLignes.reduce((total, ligne) => {
        const quantite = Number(ligne.quantite);
        const prix = Number(ligne.prix_unitaire);
        if (!Number.isFinite(quantite) || !Number.isFinite(prix)) return total;
        return total + quantite * prix;
      }, 0),
    [venteLignes],
  );

  const venteReste = useMemo(
    () => Math.max(0, venteTotal - (Number(venteMontantPaye) || 0)),
    [venteTotal, venteMontantPaye],
  );

  const clientSelectionne = useMemo(
    () => clientItems.find((client) => String(client.id) === venteClient) ?? null,
    [clientItems, venteClient],
  );

  const lignesVenteAnalysees = useMemo(() => {
    const demandes = new Map<number, number>();
    const bases = venteLignes.map((ligne) => {
      const produit = produitItems.find(
        (item) => String(item.id) === ligne.produit,
      );
      const unite = produit?.unites.find(
        (item) => String(item.id) === ligne.unite,
      );
      const facteur = Number(unite?.facteur_conversion) || 1;
      const quantite = Number(ligne.quantite);
      const quantiteBase = Number.isFinite(quantite)
        ? quantite * facteur
        : 0;
      if (produit) {
        demandes.set(
          produit.id,
          (demandes.get(produit.id) ?? 0) + quantiteBase,
        );
      }
      const prixUnitaire = Number(ligne.prix_unitaire);
      const prixTotal =
        Number.isFinite(quantite) && Number.isFinite(prixUnitaire)
          ? quantite * prixUnitaire
          : 0;

      return { produit, unite, facteur, quantite, quantiteBase, prixTotal };
    });

    return bases.map((ligne) => {
      if (!ligne.produit || !ligne.unite) {
        return { ...ligne, disponible: null, depassement: false };
      }

      const autres = (demandes.get(ligne.produit.id) ?? 0) - ligne.quantiteBase;
      const disponibleBase = Number(ligne.produit.stock_actuel) - autres;
      const disponible = Math.max(0, disponibleBase / ligne.facteur);

      return {
        ...ligne,
        disponible,
        depassement: ligne.quantite > disponible + 0.0005,
      };
    });
  }, [venteLignes, produitItems]);

  const hasStockError = lignesVenteAnalysees.some((ligne) => ligne.depassement);

  const refreshAll = () => {
    ventes.refetch();
    produits.refetch();
    clients.refetch();
    setStatsLoading(true);
    setStatsKey((key) => key + 1);
  };

  const filteredVentes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return venteItems.filter((vente) => {
      if (statutFilter !== "TOUS" && vente.statut !== statutFilter) return false;
      if (paiementFilter === "PAYEES" && Number(vente.reste_a_payer) > 0) return false;
      if (paiementFilter === "IMPAYEES" && Number(vente.reste_a_payer) <= 0) return false;
      if (!term) return true;

      return (
        vente.reference.toLowerCase().includes(term) ||
        (vente.numero_facture ?? "").toLowerCase().includes(term) ||
        vente.client_nom.toLowerCase().includes(term) ||
        vente.client_telephone.toLowerCase().includes(term)
      );
    });
  }, [venteItems, search, statutFilter, paiementFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredVentes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredVentes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const openCreateVente = () => {
    setVenteClient("");
    setVenteLignes([EMPTY_LIGNE]);
    setVenteMontantPaye("0");
    setVenteModePaiement("CREDIT");
    setVenteCle(
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `vente-${Date.now()}`,
    );
    setVenteModalOpen(true);
  };

  const resetLigne = (produitId: string): LigneVenteForm => {
    const produit = produitItems.find((item) => String(item.id) === produitId);
    const base = produit?.unites.find((unite) => unite.est_base) ?? produit?.unites[0];

    return {
      produit: produitId,
      unite: base ? String(base.id) : "",
      quantite: "1",
      prix_unitaire: base?.prix_effectif ?? produit?.prix_vente ?? "",
    };
  };

  const handleSaveVente = async () => {
    const montantPaye = Number(venteMontantPaye) || 0;
    const lignesValides = venteLignes.filter(
      (ligne) => ligne.produit && ligne.unite && Number(ligne.quantite) > 0,
    );

    if (!venteClient) {
      setActionError("Sélectionnez un client.");
      return;
    }
    if (lignesValides.length === 0) {
      setActionError("Ajoutez au moins un produit vendu.");
      return;
    }

    const ligneEnDepassement = lignesVenteAnalysees.find(
      (ligne) => ligne.depassement,
    );
    if (ligneEnDepassement?.produit && ligneEnDepassement.unite) {
      setActionError(
        `Stock insuffisant pour « ${ligneEnDepassement.produit.nom} » : ` +
          `disponible ${formatQuantite(ligneEnDepassement.disponible ?? 0)} ${
            ligneEnDepassement.unite.nom
          }, demandé ${formatQuantite(ligneEnDepassement.quantite)}.`,
      );
      return;
    }

    if (venteTotal <= 0) {
      setActionError("Le montant total de la vente doit être supérieur à 0.");
      return;
    }
    if (montantPaye > venteTotal) {
      setActionError(
        "Le montant payé ne peut pas dépasser le total de la vente.",
      );
      return;
    }
    if (montantPaye > 0 && venteModePaiement === "CREDIT") {
      setActionError(
        "Choisissez un moyen de paiement réel lorsque le montant payé est supérieur à 0.",
      );
      return;
    }
    if (montantPaye === 0 && venteModePaiement !== "CREDIT") {
      setActionError(
        "Une vente sans paiement immédiat doit utiliser le mode Crédit.",
      );
      return;
    }

    setVenteSaving(true);
    setActionError(null);
    setSuccess(null);

    try {
      const vente = await createVente({
        client: Number(venteClient),
        montant_paye: venteMontantPaye || "0",
        mode_paiement: venteModePaiement,
        cle_idempotence: venteCle || undefined,
        lignes: lignesValides.map((ligne) => ({
          produit: Number(ligne.produit),
          unite: Number(ligne.unite),
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire || undefined,
        })),
      });
      setSuccess(
        `La vente ${vente.reference} a été validée.${
          vente.numero_facture ? ` Facture ${vente.numero_facture}.` : ""
        }`,
      );
      setVenteModalOpen(false);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setVenteSaving(false);
    }
  };

  const handleAnnulerVente = async (vente: Vente) => {
    if (
      !window.confirm(
        `Annuler la vente ${vente.reference} ? Le stock sera restauré.`,
      )
    ) {
      return;
    }
    setActionError(null);
    setSuccess(null);
    try {
      await annulerVente(vente.id);
      setSuccess(`La vente ${vente.reference} a été annulée.`);
      setDetailVente(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    }
  };

  const openDetail = async (vente: Vente) => {
    setDetailVente(vente);
    setDetailPaiements([]);
    setDetailLoading(true);

    try {
      const result = await getVentePaiements(vente.id);
      setDetailPaiements(result.items);
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setDetailLoading(false);
    }
  };

  const openPaiement = (vente: Vente) => {
    setPaiementMontant(vente.reste_a_payer);
    setPaiementMode(
      vente.mode_paiement === "CREDIT" ? "ESPECES" : vente.mode_paiement,
    );
    setPaiementReference("");
    setPaiementCommentaire("");
    setPaiementVente(vente);
  };

  const handlePaiement = async () => {
    if (!paiementVente) return;
    setPaiementSaving(true);
    setActionError(null);
    setSuccess(null);

    try {
      await ajouterPaiementVente(paiementVente.id, {
        montant: paiementMontant,
        mode_paiement: paiementMode,
        reference_transaction: paiementReference.trim(),
        commentaire: paiementCommentaire.trim(),
      });
      setSuccess(
        `Paiement de ${formatMoney(paiementMontant, devise)} enregistré sur ${paiementVente.reference}.`,
      );
      setPaiementVente(null);
      refreshAll();
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setPaiementSaving(false);
    }
  };

  const handleOpenPdf = async (vente: Vente) => {
    if (!vente.facture_id) return;
    setPdfLoadingId(vente.id);
    setActionError(null);

    try {
      await ouvrirFacturePdf(vente.facture_id);
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setPdfLoadingId(null);
    }
  };

  const loading = ventes.loading || produits.loading || clients.loading;
  const error = ventes.error ?? produits.error ?? clients.error;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ventes et factures"
          description="Encaissez vos ventes, suivez les créances et générez les factures."
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
        title="Ventes et factures"
        description="Encaissez vos ventes, suivez les créances et générez les factures."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button
              type="button"
              onClick={openCreateVente}
              disabled={!canWrite || clientItems.length === 0 || produitItems.length === 0}
            >
              <Plus className="h-4 w-4" />
              Nouvelle vente
            </Button>
          </div>
        }
      />

      {!canWrite && (
        <Alert variant="warning" title="Abonnement inactif">
          La consultation reste disponible, mais les ventes sont désactivées.
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventes validées"
          value={statsLoading ? "—" : (stats?.ventes.nombre ?? 0)}
          hint={`${stats?.ventes.nombre_clients_acheteurs ?? 0} client(s) acheteur(s)`}
          icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Chiffre d'affaires"
          value={formatMoney(stats?.ventes.montant_total, devise)}
          hint="Total des ventes validées"
          icon={<Banknote className="h-4 w-4" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Encaissé"
          value={formatMoney(stats?.ventes.montant_encaisse, devise)}
          hint="Paiements reçus"
          icon={<Wallet className="h-4 w-4" aria-hidden="true" />}
          tone="brand"
        />
        <StatCard
          label="Créances"
          value={formatMoney(stats?.ventes.creances, devise)}
          hint={`${stats?.dettes.nombre_ouvertes ?? 0} dette(s) en cours`}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
          tone="danger"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
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
              placeholder="Référence, facture, client ou téléphone..."
              className="pl-9"
              aria-label="Rechercher"
            />
          </div>
          <Select
            value={statutFilter}
            onChange={(event) => {
              setStatutFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par statut"
            className="sm:w-44"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="VALIDEE">Validées</option>
            <option value="ANNULEE">Annulées</option>
          </Select>
          <Select
            value={paiementFilter}
            onChange={(event) => {
              setPaiementFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par paiement"
            className="sm:w-44"
          >
            <option value="TOUS">Tous les paiements</option>
            <option value="PAYEES">Soldées</option>
            <option value="IMPAYEES">Avec reste</option>
          </Select>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Aucune vente"
              description={
                clientItems.length === 0 || produitItems.length === 0
                  ? "Ajoutez des clients et des produits avant d'enregistrer une vente."
                  : "Vos ventes apparaîtront ici avec leur facture."
              }
              icon={<ShoppingCart className="h-5 w-5" aria-hidden="true" />}
              action={
                canWrite && clientItems.length > 0 && produitItems.length > 0 ? (
                  <Button type="button" onClick={openCreateVente}>
                    <Plus className="h-4 w-4" />
                    Nouvelle vente
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
                  <th className="px-5 py-3 font-medium">Vente</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Reste</th>
                  <th className="px-5 py-3 font-medium">Paiement</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((vente) => {
                  const config = VENTE_STATUS[vente.statut];
                  const annulee = vente.statut === "ANNULEE";
                  const soldee =
                    !annulee && Number(vente.reste_a_payer) <= 0;

                  return (
                    <tr
                      key={vente.id}
                      className="transition-colors hover:bg-surface/60"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{vente.reference}</p>
                        <p className="text-xs text-muted">
                          {vente.numero_facture ?? "Facture non émise"}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{vente.client_nom}</p>
                        <p className="text-xs text-muted">{vente.client_telephone}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                        {formatMoney(vente.montant_total, devise)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={
                            soldee ? "text-emerald-700" : "font-medium text-red-600"
                          }
                        >
                          {formatMoney(vente.reste_a_payer, devise)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            tone={annulee ? "neutral" : soldee ? "success" : "warning"}
                          >
                            {annulee ? "Annulée" : soldee ? "Soldée" : "Reste dû"}
                          </Badge>
                          <span className="text-[11px] text-muted">
                            {MODE_PAIEMENT_LABELS[vente.mode_paiement]}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(vente.date_creation, true)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetail(vente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!soldee && !annulee && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={!canWrite}
                              onClick={() => openPaiement(vente)}
                            >
                              <Banknote className="h-4 w-4" />
                              Paiement
                            </Button>
                          )}
                          {vente.facture_id && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={pdfLoadingId === vente.id}
                              onClick={() => handleOpenPdf(vente)}
                            >
                              <FileText className="h-4 w-4" />
                              {pdfLoadingId === vente.id ? "..." : "Facture"}
                            </Button>
                          )}
                          <Badge tone={config.tone}>{config.label}</Badge>
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
          totalItems={filteredVentes.length}
          pageSize={PAGE_SIZE}
          itemLabel="ventes"
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={venteModalOpen}
        onClose={() => setVenteModalOpen(false)}
        title="Nouvelle vente"
        description="La facture est générée automatiquement à la validation."
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vente-client" className="block text-sm font-medium text-ink">
                Client
              </label>
              <Select
                id="vente-client"
                value={venteClient}
                onChange={(event) => setVenteClient(event.target.value)}
                className="mt-1"
              >
                <option value="">Sélectionner...</option>
                {clientItems.map((client: Client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom} — {client.telephone}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="vente-mode" className="block text-sm font-medium text-ink">
                Mode de paiement
              </label>
              <Select
                id="vente-mode"
                value={venteModePaiement}
                onChange={(event) =>
                  setVenteModePaiement(event.target.value as ModePaiement)
                }
                className="mt-1"
              >
                {MODES_PAIEMENT.filter(
                  (mode) =>
                    mode.value !== "CREDIT" ||
                    Number(venteMontantPaye) === 0,
                ).map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {clientSelectionne && (
            <p className="rounded-xl bg-surface px-3 py-2 text-xs text-muted">
              Client :{" "}
              <span className="font-medium text-ink">
                {clientSelectionne.nom} {clientSelectionne.prenom}
              </span>{" "}
              · {clientSelectionne.telephone} · Solde dû :{" "}
              <span className="font-medium text-ink">
                {formatMoney(clientSelectionne.solde_du, devise)}
              </span>
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Produits vendus</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVenteLignes((lignes) => [...lignes, EMPTY_LIGNE])}
              >
                <Plus className="h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>

            {!produits.loading &&
              produitItems.length > 0 &&
              produitsDisponibles.length === 0 && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Tous les produits sont en rupture de stock. Enregistrez
                  d'abord une réception d'achat pour pouvoir vendre.
                </p>
              )}

            <div className="hidden gap-2 px-3 text-xs font-medium uppercase tracking-wide text-muted sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
              <span>Produit</span>
              <span>Unité</span>
              <span>Quantité</span>
              <span>Prix unitaire</span>
              <span>Prix total</span>
              <span />
            </div>

            {venteLignes.map((ligne, index) => {
              const produit = produitItems.find(
                (item) => String(item.id) === ligne.produit,
              );
              const unites = produit?.unites ?? [];
              const analyse = lignesVenteAnalysees[index];

              return (
                <div
                  key={index}
                  className="rounded-xl border border-border p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
                  <Select
                    value={ligne.produit}
                    onChange={(event) =>
                      setVenteLignes((lignes) =>
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
                    {produitItems.map((item: Produit) => {
                      const rupture = Number(item.stock_actuel) <= 0;

                      return (
                        <option key={item.id} value={item.id} disabled={rupture}>
                          {item.nom} ({formatQuantite(Number(item.stock_actuel))}{" "}
                          {item.unite_base}){rupture ? " — rupture" : ""}
                        </option>
                      );
                    })}
                  </Select>
                  <Select
                    value={ligne.unite}
                    onChange={(event) => {
                      const uniteId = event.target.value;
                      const unite = unites.find(
                        (item) => String(item.id) === uniteId,
                      );
                      setVenteLignes((lignes) =>
                        lignes.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                unite: uniteId,
                                prix_unitaire:
                                  unite?.prix_effectif ?? item.prix_unitaire,
                              }
                            : item,
                        ),
                      );
                    }}
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
                      setVenteLignes((lignes) =>
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
                    value={ligne.prix_unitaire}
                    onChange={(event) =>
                      setVenteLignes((lignes) =>
                        lignes.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, prix_unitaire: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Prix unitaire"
                    aria-label="Prix unitaire"
                  />
                  <Input
                    readOnly
                    value={
                      analyse?.unite
                        ? formatMoney(analyse.prixTotal, devise)
                        : ""
                    }
                    placeholder="Prix total"
                    aria-label="Prix total"
                    className="bg-surface text-right font-medium"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={venteLignes.length === 1}
                    onClick={() =>
                      setVenteLignes((lignes) =>
                        lignes.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  </div>
                  <p
                    className={`mt-2 text-xs ${
                      analyse?.depassement ? "text-red-600" : "text-muted"
                    }`}
                  >
                    {analyse?.produit && analyse.unite ? (
                      <>
                        Disponible pour cette unité :{" "}
                        <span className="font-medium">
                          {formatQuantite(analyse.disponible ?? 0)}{" "}
                          {analyse.unite.nom}
                        </span>
                        {analyse.depassement &&
                          " — quantité demandée supérieure au stock."}
                      </>
                    ) : (
                      "Sélectionnez un produit et une unité pour voir le stock disponible."
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="vente-montant-paye" className="block text-sm font-medium text-ink">
                Montant payé immédiatement
              </label>
              <Input
                id="vente-montant-paye"
                type="number"
                min="0"
                step="0.01"
                value={venteMontantPaye}
                onChange={(event) => {
                  const valeur = event.target.value;
                  setVenteMontantPaye(valeur);
                  if (Number(valeur) === 0) {
                    setVenteModePaiement("CREDIT");
                  } else if (venteModePaiement === "CREDIT") {
                    setVenteModePaiement("ESPECES");
                  }
                }}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted">
                Laisser 0 pour enregistrer une vente à crédit.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-ink">
                  {formatMoney(String(venteTotal), devise)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted">Payé</span>
                <span className="font-medium text-emerald-700">
                  {formatMoney(venteMontantPaye || "0", devise)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted">Reste</span>
                <span className="font-medium text-red-600">
                  {formatMoney(String(venteReste), devise)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVenteModalOpen(false)}
              disabled={venteSaving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveVente}
              disabled={
                venteSaving ||
                !venteClient ||
                venteTotal <= 0 ||
                Number(venteMontantPaye) > venteTotal ||
                hasStockError
              }
            >
              {venteSaving ? "Validation..." : "Valider la vente"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(detailVente)}
        onClose={() => setDetailVente(null)}
        title="Détail de la vente"
        description={detailVente?.reference}
        size="lg"
      >
        {detailVente && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-muted">Client</p>
                <p className="mt-1 font-medium text-ink">{detailVente.client_nom}</p>
                <p className="text-sm text-muted">{detailVente.client_telephone}</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-muted">Facture</p>
                <p className="mt-1 font-medium text-ink">
                  {detailVente.numero_facture || "—"}
                </p>
                <p className="text-sm text-muted">
                  {formatDate(detailVente.date_creation, true)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Produit</th>
                    <th className="px-4 py-2 font-medium">Qté</th>
                    <th className="px-4 py-2 font-medium">Prix unitaire</th>
                    <th className="px-4 py-2 font-medium">Prix total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detailVente.lignes.map((ligne) => (
                    <tr key={ligne.id}>
                      <td className="px-4 py-2 text-ink">{ligne.nom_produit}</td>
                      <td className="px-4 py-2 text-muted">
                        {ligne.quantite} {ligne.unite_nom}
                      </td>
                      <td className="px-4 py-2 text-muted">
                        {formatMoney(ligne.prix_unitaire, devise)}
                      </td>
                      <td className="px-4 py-2 font-medium text-ink">
                        {formatMoney(ligne.sous_total, devise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Total</p>
                <p className="mt-1 font-semibold text-ink">
                  {formatMoney(detailVente.montant_total, devise)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Payé</p>
                <p className="mt-1 font-semibold text-emerald-700">
                  {formatMoney(detailVente.montant_paye, devise)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Reste</p>
                <p className="mt-1 font-semibold text-red-600">
                  {formatMoney(detailVente.reste_a_payer, devise)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">Paiements</p>
              {detailLoading ? (
                <TableSkeleton rows={3} columns={3} />
              ) : detailPaiements.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Aucun paiement enregistré.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                  {detailPaiements.map((paiement) => (
                    <li
                      key={paiement.id}
                      className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
                    >
                      <span className="text-muted">
                        {formatDate(paiement.date_creation, true)} ·{" "}
                        {MODE_PAIEMENT_LABELS[paiement.mode_paiement]}
                      </span>
                      <span className="font-medium text-ink">
                        {formatMoney(paiement.montant, devise)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              {detailVente.statut === "VALIDEE" &&
                Number(detailVente.montant_paye) === 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleAnnulerVente(detailVente)}
                  >
                    Annuler la vente
                  </Button>
                )}
              {detailVente.facture_id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenPdf(detailVente)}
                  disabled={pdfLoadingId === detailVente.id}
                >
                  <FileText className="h-4 w-4" />
                  {pdfLoadingId === detailVente.id ? "Ouverture..." : "Ouvrir la facture"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(paiementVente)}
        onClose={() => setPaiementVente(null)}
        title="Enregistrer un paiement"
        description={
          paiementVente
            ? `${paiementVente.reference} · reste ${formatMoney(paiementVente.reste_a_payer, devise)}`
            : undefined
        }
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="paiement-montant" className="block text-sm font-medium text-ink">
              Montant
            </label>
            <Input
              id="paiement-montant"
              type="number"
              min="0.01"
              step="0.01"
              value={paiementMontant}
              onChange={(event) => setPaiementMontant(event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="paiement-mode" className="block text-sm font-medium text-ink">
              Mode de paiement
            </label>
            <Select
              id="paiement-mode"
              value={paiementMode}
              onChange={(event) =>
                setPaiementMode(event.target.value as ModePaiementReel)
              }
              className="mt-1"
            >
              {MODES_PAIEMENT.filter((mode) => mode.value !== "CREDIT").map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="paiement-reference" className="block text-sm font-medium text-ink">
              Référence transaction
            </label>
            <Input
              id="paiement-reference"
              value={paiementReference}
              onChange={(event) => setPaiementReference(event.target.value)}
              className="mt-1"
              placeholder="Optionnel"
            />
          </div>
          <div>
            <label htmlFor="paiement-commentaire" className="block text-sm font-medium text-ink">
              Commentaire
            </label>
            <Textarea
              id="paiement-commentaire"
              value={paiementCommentaire}
              onChange={(event) => setPaiementCommentaire(event.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setPaiementVente(null)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handlePaiement}
              disabled={paiementSaving || Number(paiementMontant) <= 0}
            >
              {paiementSaving ? "Enregistrement..." : "Enregistrer le paiement"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default VentesPage;
