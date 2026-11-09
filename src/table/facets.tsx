import {
  hashKey,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import type { Facet, FacetValue } from 'waldur-js-client';

/**
 * Filter facets: the values each filter can still take under the table's
 * other filters and search, as counted by a backend `facets` action
 * (`waldur_core.core.facets`). A table opts in by passing `facets` to
 * `useTable`; a filter opts in with a `facet` prop naming its facet.
 *
 * A filter mounts only when it is opened and asks for its own facet only,
 * so a table never counts facets nobody looks at.
 */

/** The SDK's `…FacetsList` function of the table's list endpoint. */
type FacetsFetcher = (options: {
  query?: Record<string, any>;
  path?: Record<string, any>;
  signal?: AbortSignal;
}) => Promise<{ data: Facet[] }>;

export interface TableFacetsOptions {
  fetch: FacetsFetcher;
  /** Path params of a nested list, as passed to `createFetcher`. */
  path?: Record<string, any>;
  /** Fixed query params the table's fetcher adds on its own. */
  query?: Record<string, any>;
}

export interface TableFacetsSource extends TableFacetsOptions {
  table: string;
  /** What the table currently filters its rows by, search included. */
  params: Record<string, any>;
}

const TableFacetsContext = createContext<TableFacetsSource | undefined>(
  undefined,
);

export const TableFacetsProvider = ({
  value,
  children,
}: {
  value?: TableFacetsSource;
  children: ReactNode;
}) => (
  <TableFacetsContext.Provider value={value}>
    {children}
  </TableFacetsContext.Provider>
);

/** Whether the surrounding table counts facets at all. */
export const useHasTableFacets = () => !!useContext(TableFacetsContext);

const fetchFacet = async (
  source: TableFacetsSource,
  name: string,
  extra: Record<string, any> = {},
  signal?: AbortSignal,
): Promise<Facet | null> => {
  const { data } = await source.fetch({
    query: { ...source.query, ...source.params, facet: name, ...extra },
    path: source.path,
    signal,
  });
  return data.find((facet) => facet.name === name) ?? null;
};

const filterFacetValues = (values: FacetValue[], search: string) => {
  const term = search.trim().toLowerCase();
  return term
    ? values.filter((value) => value.label.toLowerCase().includes(term))
    : values;
};

export interface TableFacet {
  /** Undefined until the first count arrives. */
  facet: Facet | undefined;
  /** Value → count; undefined until the first count arrives. */
  counts: Map<string, number> | undefined;
  /** Changes when the facet is counted under different filters, not when
   * its first count arrives: a menu keyed on it reloads only then. */
  cacheKey: string;
  /** Values matching a search: in memory, or from the server when the
   * facet was truncated. Waits for the first count. */
  loadValues(search: string): Promise<FacetValue[]>;
}

/** The most values one facet request may ask for (the backend's bound). */
export const MAX_FACET_LIMIT = 1000;

/**
 * The facet `name` of the surrounding table. Undefined when the filter
 * names no facet, the table has no `facets` source, or the count failed
 * (an older backend has no `facets` action): the filter then behaves as it
 * always did. `limit` raises the backend's default of 100 values, for a
 * filter that can only search what it was given.
 */
export const useTableFacet = (
  name: string | undefined,
  limit?: number,
): TableFacet | undefined => {
  const source = useContext(TableFacetsContext);
  const queryClient = useQueryClient();
  const enabled = !!source && !!name;

  const queryKey = useMemo(
    () => [
      'TableFacet',
      source?.table,
      name,
      source?.path,
      source?.query,
      source?.params,
      limit,
    ],
    [source, name, limit],
  );
  const queryFn = useCallback(
    ({ signal }: { signal?: AbortSignal }) =>
      fetchFacet(source, name, limit ? { facet_limit: limit } : {}, signal),
    [source, name, limit],
  );

  const { data: facet, isError } = useQuery({
    queryKey,
    queryFn,
    enabled,
    // A failed count leaves the filter as it was; it is no reason to leave
    // the page.
    meta: { skipGlobalErrorRedirect: true },
    // Keep the last values while a changed filter is counted again, so the
    // menu does not empty and refill.
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const counts = useMemo(
    () =>
      facet ? new Map(facet.values.map((v) => [v.value, v.count])) : undefined,
    [facet],
  );

  const loadValues = useCallback(
    async (search: string) => {
      try {
        const loaded = await queryClient.ensureQueryData({
          queryKey,
          queryFn,
          meta: { skipGlobalErrorRedirect: true },
        });
        if (!loaded) return [];
        if (loaded.truncated && search.trim()) {
          const found = await fetchFacet(source, name, {
            facet_q: search.trim(),
          });
          return found?.values ?? [];
        }
        return filterFacetValues(loaded.values, search);
      } catch {
        // The query's error state hands the filter back its own options.
        return [];
      }
    },
    [queryClient, queryKey, queryFn, source, name],
  );

  const cacheKey = useMemo(() => hashKey(queryKey), [queryKey]);

  return useMemo(
    () =>
      enabled && !isError
        ? { facet: facet ?? undefined, counts, cacheKey, loadValues }
        : undefined,
    [enabled, isError, facet, counts, cacheKey, loadValues],
  );
};

/** Builds an option of an object-valued filter from a facet value, e.g.
 * `facetOption('uuid', 'title')` for a category. */
export const facetOption =
  (valueKey: string, labelKey: string) => (value: FacetValue) => ({
    [valueKey]: value.value,
    [labelKey]: value.label,
  });

/** The query-param form of an option value, as facets report it. */
export const facetKey = (value: unknown) =>
  value === null || value === undefined ? '' : String(value);
