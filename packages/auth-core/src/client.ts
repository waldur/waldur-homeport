import Qs from 'qs';
import { configureApiClient, fixURL } from 'waldur-api-client';
import { client } from 'waldur-js-client/client.gen';
import { addApiErrorBreadcrumb } from 'waldur-telemetry';
// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in
// packages/api-client/src/requestHelpers.ts.

import { getAuthCoreConfig } from './config';

const querySerializer = (params) =>
  Qs.stringify(params, { arrayFormat: 'repeat' });

// Methods whose token is a DRF Token issued by Waldur itself, rather than an
// OIDC access token. A passkey login yields exactly the same DRF token as a
// password login, so it belongs here — without it, a passkey session on an
// OIDC-enabled deployment would send `Bearer <drf-token>` and 401 on every
// request after login.
const DRF_TOKEN_METHODS = ['local', 'passkey'];

const getAuthPrefix = (): 'Token' | 'Bearer' => {
  const config = getAuthCoreConfig();
  if (DRF_TOKEN_METHODS.includes(config.storage.method.get())) {
    return 'Token';
  }
  return config.isOidcAccessTokenEnabled() ? 'Bearer' : 'Token';
};

export const getAuthHeader = () => {
  const config = getAuthCoreConfig();
  const token = config.storage.token.get();
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
  const config = getAuthCoreConfig();
  const headers = {
    Accept: 'application/json',
  };

  if (impersonate && config.storage.impersonation.get()) {
    headers['X-IMPERSONATED-USER-UUID'] = config.storage.impersonation.get();
  } else {
    headers['X-IMPERSONATED-USER-UUID'] = null;
  }

  if (config.storage.language.get()) {
    headers['Accept-Language'] = config.storage.language.get();
  }
  return headers;
}

/**
 * Initializes the global API client configuration.
 * Sets up base URL, authentication headers, and query serialization logic.
 */
export function initApiClient() {
  const config = getAuthCoreConfig();
  configureApiClient({ apiEndpoint: config.getApiEndpoint() });
  const headers = getHeaders();
  client.setConfig({
    baseUrl: config.getApiEndpoint(),
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
// isConfigLoaded() is false until the bootstrap config request resolves;
// until then an OIDC token may already be in storage (e.g. on page reload
// after sign-in) but the prefix flag is not yet known. Skip header
// attachment in that window so the bootstrap request goes out unauthenticated.
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
  const config = getAuthCoreConfig();
  if (!config.isConfigLoaded() || !config.storage.token.get()) {
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

// Endpoints that are part of *becoming* authenticated. A 401 from any of them
// means "these credentials did not work", not "your session expired", so it
// must not trigger a logout. Missing one is not cosmetic: during a passkey
// ceremony the user is mid-login, and calling onSessionExpired() would tear
// down the flow they are in the middle of completing.
const LOGIN_ENDPOINT_PATHS = [
  'api-auth/password/',
  'api/passkeys/signin/begin/',
  'api/passkeys/signin/finish/',
  'api/passkeys/mfa/begin/',
  'api/passkeys/mfa/finish/',
];

// A 401 means an authenticated session expired — hand off to the host's
// onSessionExpired (remember where to return, then log out). Guarded on this
// tab having had a session: an anonymous visitor (e.g. browsing the public
// marketplace) has no session to lose, and its 401s from authenticated-only
// endpoints — the matrix rooms poll, etc. — must not trigger a logout.
// `hadAuthenticatedSession` covers the case where the token was cleared
// out-of-band (logout in another tab) but this tab is still showing the
// authenticated UI.
export const handleUnauthorizedResponse = (response: Response) => {
  const config = getAuthCoreConfig();
  if (
    response?.status === 401 &&
    (config.storage.token.get() || hadAuthenticatedSession) &&
    !LOGIN_ENDPOINT_PATHS.some(
      (path) => response.url === config.getApiEndpoint() + path,
    )
  ) {
    config.onSessionExpired();
  }
  return response;
};

client.interceptors.response.use(handleUnauthorizedResponse);
client.interceptors.response.use(addApiErrorBreadcrumb);

/**
 * Generic GET request helper using native fetch.
 * Handles both JSON and binary (blob) responses automatically based on content type.
 * @param endpoint The API endpoint to fetch.
 * @returns Typed result or Blob.
 */
export async function get<T = any>(endpoint: string): Promise<T> {
  const config = getAuthCoreConfig();
  const response = await fetch(
    fixURL(endpoint),
    config.storage.token.get()
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
 * Simple POST request helper using native fetch.
 * @param endpoint The API endpoint to post to.
 * @param data Optional request body.
 */
export async function post(endpoint: string, data?: object) {
  const response = await fetch(fixURL(endpoint), {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
  });
  if (!response.ok) {
    throw response;
  }
  return response;
}
