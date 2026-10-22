import { vi } from 'vitest';

/**
 * A stand-in for `useTableQuery` that serves fixed rows as one settled page,
 * so a component test renders through the real `Table` without a request.
 *
 *   vi.mock('@/table/useTableQuery', () => import('@/table/mockTableQuery'));
 *   setTableQueryRows([row]);
 *
 * Rows live in React Query's cache, not Redux, so seeding a table's Redux
 * state no longer shows rows. The result is one stable object between calls to
 * `setTableQueryRows`: a new object per render would re-run `useTable`'s
 * effects on every render.
 */
const settled = (rows: any[]) => ({
  data: { rows, resultCount: rows.length },
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
});

let result = settled([]);

export const setTableQueryRows = (rows: any[]) => {
  result = settled(rows);
};

export const useTableQuery = () => result;
