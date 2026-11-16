import { useMemo, useState } from "react";
import {
  Eye,
  FileText,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { useAllPages } from "../../../hooks/useAllPages";
import { getApiError } from "../../../services/apiError";
import {
  getAllFactures,
  ouvrirFacturePdf,
} from "../../../services/commerceService";
import type { Facture } from "../../../types/commerce";
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
import { formatDate, formatMoney } from "../../../shared/utils/format";

const PAGE_SIZE = 10;

export function MesFacturesPage() {
  const factures = useAllPages(getAllFactures);

  const [search, setSearch] = useState("");
  const [paiementFilter, setPaiementFilter] = useState("TOUTES");
  const [page, setPage] = useState(1);

  const [actionError, setActionError] = useState<string | null>(null);
  const [detailFacture, setDetailFacture] = useState<Facture | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const factureItems = useMemo(() => factures.data?.items ?? [], [factures.data]);

  const filteredFactures = useMemo(() => {
    const term = search.trim().toLowerCase();

    return factureItems.filter((facture) => {
      if (paiementFilter === "PAYEES" && !facture.est_payee) return false;
      if (paiementFilter === "IMPAYEES" && facture.est_payee) return false;
      if (!term) return true;

      return (
        facture.numero.toLowerCase().includes(term) ||
        facture.nom_commerce.toLowerCase().includes(term) ||
        facture.vente_reference.toLowerCase().includes(term)
      );
    });
  }, [factureItems, search, paiementFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFactures.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredFactures.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleOpenPdf = async (facture: Facture) => {
    setPdfLoadingId(facture.id);
    setActionError(null);

    try {
      await ouvrirFacturePdf(facture.id);
    } catch (error) {
      setActionError(getApiError(error).message);
    } finally {
      setPdfLoadingId(null);
    }
  };

  if (factures.loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mes factures"
          description="Retrouvez toutes les factures de vos achats."
        />
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <TableSkeleton rows={7} columns={5} />
        </div>
      </div>
    );
  }

  if (factures.error) {
    return <ErrorState message={factures.error} onRetry={factures.refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes factures"
        description="Retrouvez toutes les factures de vos achats."
        actions={
          <Button type="button" variant="outline" onClick={factures.refetch}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {actionError && <Alert variant="error">{actionError}</Alert>}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
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
              placeholder="Numéro, commerce ou vente..."
              className="pl-9"
              aria-label="Rechercher"
            />
          </div>
          <Select
            value={paiementFilter}
            onChange={(event) => {
              setPaiementFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par paiement"
            className="sm:w-48"
          >
            <option value="TOUTES">Toutes les factures</option>
            <option value="PAYEES">Payées</option>
            <option value="IMPAYEES">Avec reste</option>
          </Select>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Aucune facture"
              description="Les factures de vos achats apparaîtront ici."
              icon={<FileText className="h-5 w-5" aria-hidden="true" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Facture</th>
                  <th className="px-5 py-3 font-medium">Commerce</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Reste</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((facture) => (
                  <tr
                    key={facture.id}
                    className="transition-colors hover:bg-surface/60"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{facture.numero}</p>
                      <p className="text-xs text-muted">{facture.vente_reference}</p>
                    </td>
                    <td className="px-5 py-3 text-muted">{facture.nom_commerce}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-ink">
                      {formatMoney(facture.montant_total, facture.devise)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge tone={facture.est_payee ? "success" : "warning"}>
                        {facture.est_payee
                          ? "Payée"
                          : formatMoney(facture.reste_a_payer, facture.devise)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">
                      {formatDate(facture.date_emission)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailFacture(facture)}
                        >
                          <Eye className="h-4 w-4" />
                          Détail
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={pdfLoadingId === facture.id}
                          onClick={() => handleOpenPdf(facture)}
                        >
                          <Printer className="h-4 w-4" />
                          {pdfLoadingId === facture.id ? "..." : "Imprimer"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredFactures.length}
          pageSize={PAGE_SIZE}
          itemLabel="factures"
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={Boolean(detailFacture)}
        onClose={() => setDetailFacture(null)}
        title="Détail de la facture"
        description={detailFacture?.numero}
        size="lg"
      >
        {detailFacture && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-muted">Commerce</p>
                <p className="mt-1 font-medium text-ink">
                  {detailFacture.nom_commerce}
                </p>
                <p className="text-sm text-muted">
                  {detailFacture.fournisseur_telephone}
                </p>
                <p className="text-sm text-muted">
                  {detailFacture.fournisseur_adresse}
                </p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="text-xs uppercase tracking-wide text-muted">Facture</p>
                <p className="mt-1 font-medium text-ink">
                  {formatDate(detailFacture.date_emission, true)}
                </p>
                <p className="text-sm text-muted">{detailFacture.client_nom}</p>
                <p className="text-sm text-muted">{detailFacture.client_telephone}</p>
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
                  {detailFacture.lignes.map((ligne, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-ink">
                        {ligne.nom_produit ?? ligne.produit ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-muted">
                        {ligne.quantite ?? "—"} {ligne.unite_nom ?? ligne.unite ?? ""}
                      </td>
                      <td className="px-4 py-2 text-muted">
                        {formatMoney(ligne.prix_unitaire, detailFacture.devise)}
                      </td>
                      <td className="px-4 py-2 text-right text-ink">
                        {formatMoney(ligne.sous_total, detailFacture.devise)}
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
                  {formatMoney(detailFacture.montant_total, detailFacture.devise)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Payé</p>
                <p className="mt-1 font-semibold text-emerald-700">
                  {formatMoney(detailFacture.montant_paye, detailFacture.devise)}
                </p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Reste</p>
                <p className="mt-1 font-semibold text-red-600">
                  {formatMoney(detailFacture.reste_a_payer, detailFacture.devise)}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <Button
                type="button"
                onClick={() => handleOpenPdf(detailFacture)}
                disabled={pdfLoadingId === detailFacture.id}
              >
                <Printer className="h-4 w-4" />
                {pdfLoadingId === detailFacture.id
                  ? "Ouverture..."
                  : "Imprimer la facture"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MesFacturesPage;
