import { useCallback, useEffect, useState } from "react";
import type { AllPagesResult } from "../services/pagination";
import { getApiError } from "../services/apiError";

export interface AllPagesState<T> {
  data: AllPagesResult<T> | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAllPages<T>(loader: () => Promise<AllPagesResult<T>>): AllPagesState<T> {
  const [data, setData] = useState<AllPagesResult<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loader, reloadKey]);

  const refetch = useCallback(() => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return { data, loading, error, refetch };
}
