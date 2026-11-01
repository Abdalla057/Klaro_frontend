import api from "./api";
import type { Paginated } from "../types/api";

export interface AllPagesResult<T> {
  items: T[];
  count: number;
  complete: boolean;
}

export async function fetchAllPages<T>(url: string, maxPages = 50): Promise<AllPagesResult<T>> {
  const items: T[] = [];
  let count = 0;
  let complete = false;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await api.get<Paginated<T>>(url, { params: { page } });
    const data = response.data;

    count = data.count;
    items.push(...data.results);

    if (!data.next) {
      complete = true;
      break;
    }
  }

  return { items, count, complete };
}
