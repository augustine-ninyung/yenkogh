import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { ListParams, Page } from '@/services/adminApi';

interface Options {
  pageSize?: number;
  initialSort?: { column: string; ascending: boolean };
  initialFilters?: Record<string, string>;
}

/**
 * State for a table whose searching, filtering, sorting and paging happen on
 * the backend: only the page on screen is ever loaded.
 */
export function usePagedList<T>(fetchPage: (params: ListParams) => Promise<Page<T>>, options: Options = {}) {
  const pageSize = options.pageSize ?? 10;
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(options.initialFilters ?? {});
  const [sort, setSort] = useState(options.initialSort);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  // The latest fetcher is always used without making it a reason to refetch
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  useEffect(() => {
    let stale = false;
    setIsLoading(true);
    setError(null);
    fetchRef
      .current({ page, pageSize, search: debouncedSearch, filters, sort })
      .then((result) => {
        if (stale) return;
        setRows(result.rows);
        setTotal(result.total);
      })
      .catch((err: unknown) => {
        if (stale) return;
        setRows([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : 'Could not load this list.');
      })
      .finally(() => {
        if (!stale) setIsLoading(false);
      });
    // A newer request makes this one's answer irrelevant
    return () => {
      stale = true;
    };
  }, [page, pageSize, debouncedSearch, filters, sort, reloadToken]);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  /** Sorts by a column, or flips the direction if it is already the sort column. */
  const toggleSort = useCallback((column: string) => {
    setSort((prev) => ({ column, ascending: prev?.column === column ? !prev.ascending : true }));
    setPage(1);
  }, []);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    sort,
    toggleSort,
    isLoading,
    error,
    reload,
    hasFilters: Boolean(search) || Object.values(filters).some(Boolean),
  };
}
