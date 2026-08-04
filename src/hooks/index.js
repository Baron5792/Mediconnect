import { useState, useCallback } from 'react';

/** Generic data fetcher hook */
export function useFetch(fn, deps = []) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const run = useCallback(async (...args) => {
    setLoading(true);
    try {
      const res = await fn(...args);
      setData(res);
      setError(null);
      return res;
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, run };
}

/** Pagination helper */
export function usePagination(initial = 1) {
  const [page, setPage]     = useState(initial);
  const [totalPages, setTotalPages] = useState(1);
  return { page, setPage, totalPages, setTotalPages };
}

/** Debounced search */
export function useSearch(delay = 350) {
  const [raw, setRaw]         = useState('');
  const [search, setSearch]   = useState('');
  const handle = useCallback((v) => {
    setRaw(v);
    clearTimeout(handle._t);
    handle._t = setTimeout(() => setSearch(v), delay);
  }, [delay]);
  return { raw, search, handle };
}
