import Qs from 'qs';
// waldur-js-client is deliberately absent from this package's package.json.
// Root pins it to an exact prerelease build (dev.<timestamp>.<n> from
// `docs/update-local-sdk.sh`, or a `portal:` link during active SDK
// development); declaring a second exact/range copy here would drift out
// of sync with root's on every SDK regen (that script only bumps root's
// package.json) and — for a prerelease version — even `"*"` resolves to
// the latest *published* version rather than root's linked build, giving
// two physically different copies of the SDK's types at runtime. Leaving
// it undeclared lets Node's module resolution walk up to root's single
// copy, so this package always sees exactly what root sees.
import { formDataBodySerializer, RequestResult } from 'waldur-js-client';

import { getApiEndpoint } from './config';

/** Maximum number of items allowed in a single page request. */
export const MAX_PAGE_SIZE = 300;

/**
 * Constructs a URL for a specific icon by name.
 * @param name Icon identifier.
 * @param language Optional language code for localized icons.
 * @returns Fully qualified icon URL.
 */
export const getIconUrl = (name: string, language?: string) => {
  const baseUrl = `${getApiEndpoint()}api/icons/${name}/`;
  if (language) {
    return `${baseUrl}?language=${language}`;
  }
  return baseUrl;
};

/**
 * Ensures an endpoint URL is absolute and properly prefixed with the API base.
 * @param endpoint Relative or absolute endpoint path.
 * @returns Fully qualified absolute URL.
 */
export const fixURL = (endpoint: string) =>
  endpoint.startsWith('http')
    ? endpoint
    : `${getApiEndpoint()}${endpoint.startsWith('/api') ? '' : 'api'}${endpoint}`;

/**
 * Extracts the total item count from the API response headers.
 * Uses the 'x-result-count' header which is standard for Waldur collection endpoints.
 * @param result The API request result object.
 * @returns The total number of items available for the query.
 */
export const fetchResultCount = (result: Awaited<RequestResult>): number =>
  parseInt(result.response.headers.get('x-result-count'), 10);

/**
 * Transforms an API response into a format suitable for selection components.
 * @param result The API request result containing data and response headers.
 * @returns An object with 'options' (the raw items) and 'totalItems' (count from headers).
 */
export function parseSelectData<TData = {}>(
  result: Awaited<RequestResult<TData>>,
) {
  return {
    options: (Array.isArray(result.data) ? result.data : []) as TData,
    totalItems: fetchResultCount(result),
  };
}

/**
 * extracts the 'next' page URL from the standard Link header.
 * @param response The raw Response object.
 * @returns The absolute URL for the next page or null if not available.
 */
export const getNextPageUrl = (response) => {
  // Extract next page URL from header links
  const link = response.headers['link'] || response.headers.get('link');
  if (!link) {
    return null;
  }

  const nextLink = link
    .split(', ')
    .filter((s) => s.indexOf('rel="next"') > -1)[0];
  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
};

/**
 * Callback function to monitor the progress of a multi-page API fetching operation.
 * @param page The index of the page currently processed.
 * @param totalPages Total estimated number of pages, computed heuristically based on 'x-result-count'.
 */
export type ProgressCallback = (
  page: number,
  totalPages: number | undefined,
) => void;

/**
 * Fetches all pages for a collection endpoint iteratively.
 * @param fetchPage Callback that performs the request for a specific page.
 * @param onProgress Optional callback to track the loading status across multiple pages.
 * @returns A flattened array containing items from all pages.
 */
export async function getAllPages<T>(
  fetchPage: (page: number) => Promise<{ data?: T[]; response?: any }>,
  onProgress?: ProgressCallback,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let totalPages: number | undefined;
  let hasNext = true;

  while (hasNext) {
    const result = await fetchPage(page);
    const pageData = result.data || [];
    results.push(...pageData);

    if (onProgress) {
      const totalItems = fetchResultCount(result as any);
      const pageSize = pageData.length;
      if (!Number.isNaN(totalItems) && pageSize > 0) {
        totalPages = Math.ceil(totalItems / pageSize);
      }
      onProgress(page, totalPages);
    }

    if (result.response) {
      hasNext = Boolean(getNextPageUrl(result.response));
    } else {
      hasNext = false;
    }
    page += 1;
  }
  return results;
}

/**
 * Default options for multipart/form-data requests.
 * Explicitly clears Content-Type header to allow browser to set boundary automatically.
 */
export const formDataOptions = {
  ...formDataBodySerializer,
  headers: {
    'Content-Type': null,
  },
};

/**
 * Serializes file/image fields for form submissions.
 * @param image The input value (File object, null or existing URL string).
 * @returns The File object, an empty string (to clear), or undefined.
 */
export const fileSerializer = (image) => {
  if (image === null) {
    return '' as null;
  } else if (image instanceof File) {
    return image;
  } else {
    return undefined;
  }
};

/**
 * Parses a numeric page identifier from a given URL string.
 * @param link The URL containing a 'page' query parameter.
 * @returns The page number or null.
 */
export function getNextPageNumber(link: string): number {
  if (link) {
    const parts = Qs.parse(link.split('/?')[1]);
    if (parts && typeof parts.page === 'string') {
      return parseInt(parts.page, 10);
    }
  } else {
    return null;
  }
}

/**
 * Helper to parse the next page number directly from an API result.
 * @param result The SDK RequestResult.
 */
export const parseNextPage = (result) =>
  getNextPageNumber(getNextPageUrl(result.response));
