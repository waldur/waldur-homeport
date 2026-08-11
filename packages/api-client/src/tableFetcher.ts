// waldur-js-client is deliberately not in this package's package.json —
// see the comment in requestHelpers.ts.
import { RequestResult } from 'waldur-js-client';

import { fetchResultCount, parseNextPage } from './requestHelpers';
import { Fetcher, FetcherOptions, TableRequest } from './types';

/** Default page size for client-side-paginated (in-memory) tables. */
export const PAGE_SIZE_FULL = 10;

export const processApiResponse = <TData = any>(
  result: Awaited<RequestResult<TData>>,
  parser?: (data: any, query?: any) => any[],
  query?: any,
) => {
  const contentType = result.response.headers
    .get('content-type')
    .toLowerCase()
    .split(';')[0]
    .trim();
  if (contentType !== 'application/json') {
    throw new Error('Unexpected response content type');
  }
  const rows = parser ? parser(result.data, query) : (result.data as any[]);
  const resultCount = fetchResultCount(result);
  const nextPage = parseNextPage(result);
  return {
    rows,
    resultCount,
    nextPage,
  };
};

export type DataPage<TData = any> = ReturnType<
  typeof processApiResponse<TData>
>;

export type SdkFunction<
  QueryPayload = any,
  PathPayload = any,
  DataType = any,
> = (options?: {
  query?: QueryPayload;
  path?: PathPayload;
  signal?: AbortSignal;
}) => RequestResult<DataType>;

/**
 * Extracts the item type from an SDK list function's response type.
 * SDK functions return RequestResult<Array<ItemType>>
 * This utility extracts ItemType from that structure.
 */
type ExtractItemType<F> = F extends (
  ...args: any[]
) => Promise<{ data: infer R } | { data: undefined }>
  ? R extends Array<infer Item>
    ? Item
    : R
  : any;

/**
 * Creates a fetcher function for a table, using a type-safe SDK function.
 * The row type is automatically inferred from the SDK function's response type.
 * @param sdkFunction - The SDK function to call for fetching data.
 * @param options - Default options for the fetcher.
 */
export function createFetcher<F extends SdkFunction<any, any, any>>(
  sdkFunction: F,
  options?: F extends SdkFunction<infer Q, infer P, any>
    ? FetcherOptions<Q, P, ExtractItemType<F>>
    : never,
): Fetcher<ExtractItemType<F>> {
  return (request: TableRequest) => {
    const {
      query: optionsParams,
      path: pathParams,
      parser,
      ...restOptions
    } = options || {};

    const { params: requestOptionsParams, ...restRequestOptions } =
      request.options || {};

    const mergedQueryParams = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
      ...optionsParams,
      ...requestOptionsParams,
    };

    // staleTime is a React Query option, not an SDK option — keep it out of the
    // request forwarded to the SDK.
    const { staleTime, ...sdkOptions } = {
      ...restOptions,
      ...restRequestOptions,
    };
    void staleTime;

    // Call the SDK directly. The caller (useTableQuery) already wraps this in a
    // React Query useQuery that owns caching, dedupe and a fresh abort signal
    // per attempt. A previous nested queryClient.fetchQuery here captured that
    // signal in its own retry closure, so a single mid-flight cancellation
    // (a concurrent refetch, or a filter/pagination change) turned into an ~8s
    // abort/retry storm instead of a clean cancel.
    return sdkFunction({
      path: pathParams,
      query: mergedQueryParams,
      ...sdkOptions,
    }).then((result) => processApiResponse(result, parser, mergedQueryParams));
  };
}

export async function fetchAll(fetch: Fetcher, request: TableRequest) {
  let response = await fetch(request);
  let result = [];

  while (true) {
    result = result.concat(response.rows);
    if (response.nextPage) {
      request.currentPage = response.nextPage;
      response = await fetch(request);
    } else {
      break;
    }
  }
  return result;
}

interface ClientPaginationOptions {
  /**
   * Name of the field used both as the table's `queryField` and as the row
   * attribute to search, enabling client-side search for static-data tables.
   */
  queryField?: string;
}

const compareRowValues = (a: unknown, b: unknown) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

// Helper to create client-side paginated fetcher
export const createClientPaginatedFetcher =
  <T>(allData: T[], options?: ClientPaginationOptions) =>
  (request: TableRequest) => {
    const { currentPage, pageSize, filter } = request;
    let data = allData;

    const queryField = options?.queryField;
    const query = queryField ? filter?.[queryField] : undefined;
    if (query) {
      const term = String(query).toLowerCase();
      data = data.filter((row) =>
        String((row as any)[queryField] ?? '')
          .toLowerCase()
          .includes(term),
      );
    }

    const ordering = filter?.o;
    if (typeof ordering === 'string' && ordering) {
      const desc = ordering.startsWith('-');
      const field = desc ? ordering.slice(1) : ordering;
      data = [...data].sort((a, b) => {
        const result = compareRowValues((a as any)[field], (b as any)[field]);
        return desc ? -result : result;
      });
    }

    const size = pageSize || PAGE_SIZE_FULL;
    const page = currentPage || 1;
    const startIndex = (page - 1) * size;
    if (page > 1 && startIndex >= data.length) {
      // Pagination state persists in Redux per table key, so a shrunken
      // dataset can leave the table on a page past the end. Mirror the DRF
      // "Invalid page." error so useTableQuery resets pagination instead of
      // rendering a permanently empty page.
      return Promise.reject(
        Object.assign(new Error('Invalid page.'), { detail: 'Invalid page.' }),
      );
    }
    const endIndex = startIndex + size;

    return Promise.resolve({
      rows: data.slice(startIndex, endIndex),
      resultCount: data.length,
      nextPage: endIndex < data.length ? page + 1 : null,
    });
  };
