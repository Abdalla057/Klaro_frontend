import api from "./api";
import type { Paginated } from "../types/api";

export interface AllPagesResult<T> {
  items: T[];
  count: number;
  complete: boolean;
}

type Filtres = Record<string, string | number | boolean | undefined>;

const MAX_PAGES_PARALLELES = 4;

export async function fetchAllPages<T>(
  url: string,
  maxPages = 50,
  params: Filtres = {},
): Promise<AllPagesResult<T>> {
  const chargerPage = async (page: number) => {
    const response = await api.get<Paginated<T>>(url, {
      params: { ...params, page },
    });
    return response.data;
  };

  const premierePage = await chargerPage(1);
  const pages: Paginated<T>[] = [premierePage];
  let page = 2;
  let complete = premierePage.next === null;

  while (!complete && page <= maxPages) {
    const lots: Promise<Paginated<T>>[] = [];
    for (let i = 0; i < MAX_PAGES_PARALLELES && page <= maxPages; i += 1) {
      lots.push(chargerPage(page));
      page += 1;
    }
    const resultats = await Promise.all(lots);
    pages.push(...resultats);
    complete = resultats.some((resultat) => resultat.next === null);
  }

  return {
    items: pages.flatMap((resultat) => resultat.results),
    count: premierePage.count,
    complete,
  };
}
