import { useEffect, useState, type ReactNode } from "react";
import { Search, SearchX } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";
import { Select } from "../../../shared/ui/select";
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-eyebrow uppercase text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-pine" aria-hidden="true" />
          Espace super admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
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
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <Input
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
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
    <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="sm:w-48">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
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
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-muted">
            <SearchX className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="max-w-sm text-sm text-muted">{vide}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-176 text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-panel/70 text-[11px] uppercase tracking-[0.12em] text-muted">
                  {entetes.map((e) => (
                    <th key={e} scope="col" className="px-5 py-3.5 font-medium first:pl-6 last:pr-6">
                      {e}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {visibles.map((ligne) => (
                  <tr key={cle(ligne)} className="align-middle transition-colors hover:bg-mint/45">
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
        "flex h-8 w-8 items-center justify-center rounded-xl border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/30",
        tone === "default" && "bg-panel text-muted hover:bg-sage hover:text-ink",
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
