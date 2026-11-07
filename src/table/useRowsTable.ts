import { useMemo, useRef } from 'react';

import { createClientPaginatedFetcher } from './api';
import { TableOptionsType } from './types';
import { useTable } from './useTable';

/** How the table's Export writes its rows, when its columns do not say. */
type RowsTableExport<T> = Pick<
  TableOptionsType<T>,
  'exportFields' | 'exportRow' | 'exportData'
>;

/**
 * A table over rows already in hand, paged like any other: each page is a
 * slice of ``rows``. ``loaded`` stands for the data the rows come from; a
 * new value starts the table over.
 */
export const useRowsTable = <T>(
  name: string,
  rows: T[],
  loaded: unknown,
  exportOptions?: RowsTableExport<T>,
) => {
  const rowsRef = useRef<T[]>([]);
  rowsRef.current = rows;
  const filter = useMemo(() => ({ loaded }), [loaded]);
  return useTable<T>({
    table: name,
    filter,
    fetchData: (request) =>
      createClientPaginatedFetcher(rowsRef.current)(request),
    ...exportOptions,
  });
};
