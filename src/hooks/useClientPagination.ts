import { useMemo, useState, useEffect } from 'react';
import { PaginationMeta } from '@/components/Pagination/types';

interface UseClientPaginationOptions {
  perPage?: number;
}

interface UseClientPaginationResult<T> {
  paginated: T[];
  meta: PaginationMeta;
  page: number;
  setPage: (page: number) => void;
}

export function useClientPagination<T>(
  items: T[],
  deps: unknown[] = [],
  options: UseClientPaginationOptions = {},
): UseClientPaginationResult<T> {
  const perPage = options.perPage ?? 10;
  const [page, setPage] = useState(1);

  // Reset to page 1 when deps change
  useEffect(() => {
    setPage(1);
  }, deps);

  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  // Clamp page if items shrink
  const safePage = Math.min(page, lastPage);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, safePage, perPage]);

  const meta: PaginationMeta = {
    current_page: safePage,
    last_page: lastPage,
    per_page: perPage,
    total,
  };

  return { paginated, meta, page: safePage, setPage };
}
