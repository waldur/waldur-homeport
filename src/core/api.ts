import Qs from 'qs';
import { formDataBodySerializer, RequestResult } from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { localLogout } from '@/auth/AuthService';
import { ENV } from '@/core/config';
import {
  ImpersonationStorage,
  RedirectStorage,
  AuthTokenStorage,
  LanguageStorage,
  AuthMethodStorage,
} from '@/core/StorageManager';
import { cleanObject } from '@/core/utils';
import { router } from '@/router';

/** Maximum number of items allowed in a single page request. */
export const MAX_PAGE_SIZE = 300;

const querySerializer = (params) =>
  Qs.stringify(params, { arrayFormat: 'repeat' });

const getAuthPrefix = (): 'Token' | 'Bearer' => {
  const method = AuthMethodStorage.get();
  if (method === 'local') {
    return 'Token';
  }
  // ENV.plugins is undefined until the bootstrap `configurationRetrieve`
  // request resolves. That request itself passes through the auth interceptor,
  // so for an OIDC session whose token is already in storage (e.g. right after
  // the myAccessID redirect, on page reload) this runs before config is loaded.
  // Default to the non-Bearer prefix until the flag is known to avoid crashing
  // the whole app bootstrap.
  if (!ENV.plugins?.WALDUR_CORE?.OIDC_ACCESS_TOKEN_ENABLED) {
    return 'Token';
  }
  return 'Bearer';
};

export const getAuthHeader = () => {
  const token = AuthTokenStorage.get();
  const prefix = getAuthPrefix();
  if (token) {
    return [prefix, token].join(' ');
  }
};

/**
 * Generates default HTTP headers for API requests.
 * @param impersonate Whether to include impersonation headers if active.
 * @returns An object containing common headers like Accept and Accept-Language.
 */
export function getHeaders(impersonate = true) {
  const headers = {
    Accept: 'application/json',
  };

  if (impersonate && ImpersonationStorage.get()) {
    headers['X-IMPERSONATED-USER-UUID'] = ImpersonationStorage.get();
  } else {
    headers['X-IMPERSONATED-USER-UUID'] = null;
  }

  if (LanguageStorage.get()) {
    headers['Accept-Language'] = LanguageStorage.get();
  }
  return headers;
}

/**
 * Initializes the global API client configuration.
 * Sets up base URL, authentication headers, and query serialization logic.
 */
export function initApiClient() {
  const headers = getHeaders();
  client.setConfig({
    baseUrl: ENV.apiEndpoint,
    throwOnError: true,
    headers,
    querySerializer,
  });
}

// Set the Authorization header directly rather than via the client's `auth`
// option. Operations advertise both an apiKey and an http "bearer" security
// scheme, and the client formats the `auth` value per scheme — for the bearer
// scheme it prepends "Bearer ", turning our "Token <key>" value into the
// malformed "Bearer Token <key>" (rejected by DRF). Sending the header raw
// preserves the correct "Token <key>" / "Bearer <oidc-token>" value.
// ENV.plugins is populated by configurationRetrieve; until that resolves,
// an OIDC token may already be in storage (e.g. on page reload after sign-in)
// but the prefix flag is not yet known. Skip header attachment in that
// window so the bootstrap request goes out unauthenticated.
// Records whether this tab has ever sent an authenticated request. Kept in
// memory (not storage) so it survives the token being cleared out-of-band —
// e.g. a logout in another tab wipes shared storage, but this still-running tab
// must know it once had a session so a subsequent 401 logs it out instead of
// silently failing. A genuine anonymous visitor never attaches a token, so this
// stays false and its 401s are left alone.
let hadAuthenticatedSession = false;

// Resets the in-memory session-tracking flag. Not used in production (the flag
// is intentionally sticky for the tab's lifetime); exposed so tests can isolate
// cases that would otherwise leak the flag across the shared module instance.
export const resetAuthSessionTracking = () => {
  hadAuthenticatedSession = false;
};

export const attachAuthHeader = (request: Request) => {
  if (!ENV.plugins || !AuthTokenStorage.get()) {
    return request;
  }
  const authHeader = getAuthHeader();
  if (authHeader) {
    request.headers.set('Authorization', authHeader);
    hadAuthenticatedSession = true;
  }
  return request;
};

client.interceptors.request.use(attachAuthHeader);

client.interceptors.error.use((error: Error, response) => {
  return {
    ...error,
    response,
  };
});

// A 401 means an authenticated session expired — log out and bounce to login,
// remembering where to return. Guarded on this tab having had a session: an
// anonymous visitor (e.g. browsing the public marketplace) has no session to
// lose, and its 401s from authenticated-only endpoints — the matrix rooms poll,
// etc. — must not kick it to the login page. `hadAuthenticatedSession` covers
// the case where the token was cleared out-of-band (logout in another tab) but
// this tab is still showing the authenticated UI.
export const handleUnauthorizedResponse = (response: Response) => {
  if (
    response?.status === 401 &&
    (AuthTokenStorage.get() || hadAuthenticatedSession) &&
    response.url !== ENV.apiEndpoint + 'api-auth/password/'
  ) {
    if (router.globals.transition) {
      const target = router.globals.transition.targetState();
      RedirectStorage.set({
        toState: target.name(),
        toParams: target.params(),
      });
    } else if (router.globals.$current.name === 'login') {
      RedirectStorage.set(router.globals.params as any);
    } else if (router.globals.$current.name) {
      RedirectStorage.set({
        toState: router.globals.$current.name,
        toParams: router.globals.params
          ? cleanObject(router.globals.params)
          : undefined,
      });
    }
    localLogout();
  }
  return response;
};

client.interceptors.response.use(handleUnauthorizedResponse);

/**
 * Constructs a URL for a specific icon by name.
 * @param name Icon identifier.
 * @param language Optional language code for localized icons.
 * @returns Fully qualified icon URL.
 */
export const getIconUrl = (name: string, language?: string) => {
  const baseUrl = `${ENV.apiEndpoint}api/icons/${name}/`;
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
    : `${ENV.apiEndpoint}${endpoint.startsWith('/api') ? '' : 'api'}${endpoint}`;

/**
 * Extracts the total item count from the API response headers.
 * Uses the 'x-result-count' header which is standard for Waldur collection endpoints.
 * @param result The API request result object.
 * @returns The total number of items available for the query.
 */
export const fetchResultCount = (result: Awaited<RequestResult>): number =>
  parseInt(result.response.headers.get('x-result-count'), 10);

/**
 * Generic GET request helper using native fetch.
 * Handles both JSON and binary (blob) responses automatically based on content type.
 * @param endpoint The API endpoint to fetch.
 * @returns Typed result or Blob.
 */
export async function get<T = any>(endpoint: string): Promise<T> {
  const response = await fetch(
    fixURL(endpoint),
    AuthTokenStorage.get()
      ? {
          headers: { Authorization: getAuthHeader() },
        }
      : {},
  );
  if (!response.ok) {
    throw response;
  }
  const contentType = response.headers
    .get('content-type')
    ?.toLowerCase()
    .split(';')[0]
    .trim();
  if (contentType === 'application/json') {
    return await response.json();
  } else {
    return (await response.blob()) as T;
  }
}

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
 * Simple POST request helper using native fetch.
 * @param endpoint The API endpoint to post to.
 * @param data Optional request body.
 */
export async function post(endpoint: string, data?: object) {
  await fetch(fixURL(endpoint), {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
  });
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
