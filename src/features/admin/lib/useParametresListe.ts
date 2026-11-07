import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/** Filtres d'une page de liste, conservés dans l'URL (recherche globale, alertes, liens). */
export function useParametresListe(cles: string[]) {
  const [params, setParams] = useSearchParams();

  const valeur = (cle: string) => params.get(cle) ?? "";

  /** Met à jour plusieurs paramètres en une seule navigation (valeur vide = suppression). */
  const definir = useCallback(
    (changements: Record<string, string>) => {
      const suivant = new URLSearchParams(params);
      for (const [cle, v] of Object.entries(changements)) {
        if (v) suivant.set(cle, v);
        else suivant.delete(cle);
      }
      setParams(suivant, { replace: true });
    },
    [params, setParams],
  );

  const signature = cles.map((c) => params.get(c) ?? "").join("|");
  return { valeur, definir, signature };
}
