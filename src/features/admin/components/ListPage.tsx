import { useEffect, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Modal } from "../../../shared/ui/modal";
import { Pagination } from "../../../shared/ui/pagination";
import { Textarea } from "../../../shared/ui/textarea";
import { cn } from "../../../shared/utils/cn";
import { Panel } from "./dashboard/Panel";

export const TAILLE_PAGE = 10;

export function ListPageHeader({
  titre,
  description,
  actions,
}: {
  titre: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{titre}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Toolbar({
  recherche,
  onRecherche,
  placeholder,
  children,
}: {
  recherche: string;
  onRecherche: (valeur: string) => void;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-white px-3.5 text-sm focus-within:ring-2 focus-within:ring-pine/25">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted/80"
        />
      </label>
      {children}
    </div>
  );
}

export function FiltreSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (valeur: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 rounded-2xl bg-white px-3.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-pine/25"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Tableau paginé côté client, dans une carte arrondie. */
export function DataPanel<T>({
  lignes,
  entetes,
  rendu,
  cle,
  vide,
  libelle,
  resetKey,
}: {
  lignes: T[];
  entetes: string[];
  rendu: (ligne: T) => ReactNode;
  cle: (ligne: T) => string | number;
  vide: ReactNode;
  libelle: string;
  /** Change quand les filtres changent, pour revenir à la page 1. */
  resetKey: string;
}) {
  const [page, setPage] = useState(1);
  const [cleVue, setCleVue] = useState(resetKey);
  if (cleVue !== resetKey) {
    setCleVue(resetKey);
    setPage(1);
  }

  const pages = Math.max(1, Math.ceil(lignes.length / TAILLE_PAGE));
  const courante = Math.min(page, pages);
  const visibles = lignes.slice((courante - 1) * TAILLE_PAGE, courante * TAILLE_PAGE);

  useEffect(() => {
    window.scrollTo?.({ top: 0 });
  }, [courante]);

  return (
    <Panel className="overflow-hidden p-0">
      {lignes.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-muted">{vide}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-176 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  {entetes.map((e) => (
                    <th key={e} scope="col" className="px-5 py-3.5 font-medium first:pl-6 last:pr-6">
                      {e}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {visibles.map((ligne) => (
                  <tr key={cle(ligne)} className="align-middle transition-colors hover:bg-white/60">
                    {rendu(ligne)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={courante}
            totalPages={pages}
            totalItems={lignes.length}
            pageSize={TAILLE_PAGE}
            itemLabel={libelle}
            onPageChange={setPage}
          />
        </>
      )}
    </Panel>
  );
}

export const Cell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn("px-5 py-3.5 first:pl-6 last:pr-6", className)}>{children}</td>
);

export function ActionBouton({
  label,
  onClick,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "success";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/30",
        tone === "default" && "bg-white text-ink hover:bg-sage",
        tone === "success" && "bg-pine/10 text-pine-deep hover:bg-pine/20",
        tone === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
      )}
    >
      {children}
    </button>
  );
}

/** Fenêtre demandant un motif obligatoire (suspension, annulation, refus). */
export function MotifDialog({
  open,
  titre,
  description,
  confirmLabel,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  titre: string;
  description: string;
  confirmLabel: string;
  loading: boolean;
  onConfirm: (motif: string) => void;
  onClose: () => void;
}) {
  const [motif, setMotif] = useState("");

  const resetAndClose = () => {
    setMotif("");
    onClose();
  };

  const handleConfirm = () => {
    const motifValide = motif.trim();
    setMotif("");
    onConfirm(motifValide);
  };

  return (
    <Modal open={open} onClose={resetAndClose} title={titre} description={description} size="sm">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-ink">
          Motif
          <Textarea
            className="mt-1.5"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Précisez la raison de cette action"
            autoFocus
          />
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={resetAndClose} disabled={loading}>
            Retour
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading || motif.trim().length < 3}
            onClick={handleConfirm}
          >
            {loading ? "Traitement..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
