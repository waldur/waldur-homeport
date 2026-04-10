import { useQuery } from '@tanstack/react-query';
import { concat, uniq } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useDebouncedValue } from '@waldur/core/useDebouncedValue';
import { orderByFilter } from '@waldur/core/utils';

import { Fetcher, Sorting, TableRequest } from './types';
import { transformRows } from './utils';

interface UseTableQueryOptions {
  table: string;
  fetchData: Fetcher;
  filter?: Record<string, any>;
  staleTime?: number;
  queryField?: string;
  mandatoryFields?: string[];
  onFetch?: (rows: any[], totalCount: number, firstFetch: boolean) => void;
  // Redux state needed for request building
  currentPage: number;
  pageSize: number;
  query: string;
  sorting: Sorting & { loading?: boolean };
  activeColumns: Record<string, string[] | false>;
}

interface TableQueryData {
  entities: Record<string, any>;
  order: string[];
  resultCount: number;
  rows: any[];
  invalidPage?: boolean;
}

interface UseTableQueryResult {
  data: TableQueryData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTableQuery(
  options: UseTableQueryOptions,
): UseTableQueryResult {
  const {
    table,
    fetchData,
    filter,
    staleTime,
    queryField,
    mandatoryFields,
    onFetch,
    currentPage,
    pageSize,
    query,
    sorting,
    activeColumns,
  } = options;

  const firstFetchRef = useRef(true);

  // Debounce query to avoid too many requests
  const debouncedQuery = useDebouncedValue(query, 100);

  // Build fields array (same logic as saga)
  const fields = useMemo(() => {
    let result: string[] = [];
    if (filter?.field || Object.keys(activeColumns).length) {
      const customFields = filter?.field || ['uuid'];
      const activeFields = Object.values(activeColumns)
        .filter(Boolean)
        .flat() as string[];
      result = uniq(concat(customFields, activeFields));
    }
    if (mandatoryFields) {
      result = uniq(concat(result, mandatoryFields));
    }
    return result;
  }, [filter?.field, activeColumns, mandatoryFields]);

  // Build request (same logic as saga)
  const buildRequest = useCallback(
    (signal: AbortSignal): TableRequest => {
      const request: TableRequest = {
        tableKey: table,
        currentPage,
        pageSize,
        filter: {
          ...filter,
          field: fields.length > 0 ? fields : undefined,
        },
      };

      if (queryField && debouncedQuery !== '') {
        request.filter[queryField] = debouncedQuery;
      }

      if (sorting && sorting.field) {
        request.filter.o = orderByFilter(sorting);
      }

      request.options = { signal };
      if (staleTime) {
        request.options.staleTime = staleTime;
      }

      return request;
    },
    [
      table,
      currentPage,
      pageSize,
      filter,
      fields,
      queryField,
      debouncedQuery,
      sorting,
      staleTime,
    ],
  );

  // Query key includes all parameters that affect the request
  const queryKey = useMemo(
    () => [
      'table',
      table,
      currentPage,
      pageSize,
      debouncedQuery,
      sorting?.field,
      sorting?.mode,
      filter,
      fields,
    ],
    [
      table,
      currentPage,
      pageSize,
      debouncedQuery,
      sorting?.field,
      sorting?.mode,
      filter,
      fields,
    ],
  );

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch: rqRefetch,
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const request = buildRequest(signal);
      try {
        const response = await fetchData(request);
        const { entities, order } = transformRows(response.rows);
        return {
          entities,
          order,
          resultCount: response.resultCount ?? response.rows.length,
          rows: response.rows,
        };
      } catch (err) {
        // Handle "Invalid page" error by returning empty result with flag
        // This prevents the global 404 handler from redirecting
        // SDK throws error body directly: { detail: "Invalid page." }
        // Axios-style errors have: error.response.data.detail
        const detail =
          (err as any)?.detail || (err as any)?.response?.data?.detail;
        if (detail === 'Invalid page.') {
          return {
            entities: {},
            order: [],
            resultCount: 0,
            rows: [],
            invalidPage: true,
          };
        }
        throw err;
      }
    },
    staleTime,
  });

  // Call onFetch callback when data changes
  useEffect(() => {
    if (data && onFetch) {
      onFetch(data.rows, data.resultCount, firstFetchRef.current);
      firstFetchRef.current = false;
    }
  }, [data, onFetch]);

  const refetch = useCallback(() => {
    rqRefetch();
  }, [rqRefetch]);

  return {
    data,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}
