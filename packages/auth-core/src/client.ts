import Qs from 'qs';
import { configureApiClient, fixURL } from 'waldur-api-client';
import { client } from 'waldur-js-client/client.gen';
import { addApiErrorBreadcrumb } from 'waldur-telemetry';
// waldur-js-client is deliberately absent from this package's package.json —
// see the comment on the same import in
// packages/api-client/src/requestHelpers.ts.

import { getAuthHeader } from './authHeader';
import { getAuthCoreConfig } from './config';
import {
  handleReauthenticationChallenge,
  readReauthenticationChallenge,
} from './reauthentication';

export { getAuthHeader } from './authHeader';

const querySerializer = (params) =>
  Qs.stringify(params, { arrayFormat: 'repeat' });

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

const PATH_PARAM_RE = /\{([^{}]+)\}/g;

/**
 * Raised instead of sending a request whose url template still has a path
 * parameter without a value.
 */
export class UnfilledPathParamError extends Error {
  constructor(readonly url: string) {
    super(`Path parameter missing in ${url}`);
    this.name = 'UnfilledPathParamError';
  }
}

// The generated client skips a path parameter whose value is undefined or
// null and leaves its `{name}` placeholder in the url, so the call still goes
// out as e.g. GET /api/proposal-protected-calls/%7Buuid%7D/. That happens
// whenever a page fetches with an id read from the router while the router is
// already leaving it: a 404 sends the app to the error page, the still-mounted
// page sees that state's params (none), and its query refetches with an
// undefined id. Such a request can only ever 404, so it is refused here,
// before the network, for every endpoint at once.
export const refuseUnfilledPathParams = (
  request: Request,
  options?: { url?: string; path?: Record<string, unknown> },
) => {
  const template = options?.url;
  if (typeof template !== 'string') {
    return request;
  }
  for (const [, raw] of template.matchAll(PATH_PARAM_RE)) {
    // Strip the serialization style markers the generator may add
    // ({.name}, {;name}, {name*}).
    const name = raw.replace(/^[.;]/, '').replace(/\*$/, '');
    const value = options.path?.[name];
    if (value === undefined || value === null) {
      throw new UnfilledPathParamError(template);
    }
  }
  return request;
};

client.interceptors.request.use(refuseUnfilledPathParams);
client.interceptors.request.use(attachAuthHeader);

// The generated client throws the *raw response body* on a non-2xx --
// `throw jsonError ?? textError` -- so what reaches a caller is a plain object,
// or a bare string when the body is not JSON (an ingress controller's HTML
// error page, a proxy timeout page). It carries no status, and the fetch's
// `Response` is not attached to it. This interceptor is where that is repaired.
//
// Three things matter here, each of which was wrong before:
//
//   * A failure with no `response` is the fetch itself rejecting -- a network
//     error, a CORS block, blocked mixed content, a TLS failure. `error` is
//     then a real `TypeError` and must be handed through untouched: spreading
//     it produced a plain object (an Error's `message` and `stack` are
//     non-enumerable, so the spread copied nothing), which silently destroyed
//     every `instanceof TypeError` check downstream. That is what reduced a
//     blocked bootstrap request to "Unable to fetch server configuration." with
//     no endpoint and no cause.
//   * Spreading a *string* body indexes it by character, turning an HTML error
//     page into {0: '<', 1: 'h', ...}. Non-object bodies go under `body`.
//   * `status` / `statusText` / `url` are lifted to the top level so a caller
//     can classify an error without reaching into `response`. `response` itself
//     is kept because much of the app reads `error.response.status`.
//   * Lifting them overwrites any body field of the same name: a DRF error on
//     a field called `url` or `status` was replaced by the request URL or the
//     status code, and the toast lost the message. The body is therefore also
//     kept whole under `data`, which `getErrorBody` and the error formatter read
//     before the spread keys.
//   * An Error is passed through untouched as well, response or not. It is
//     not the API's answer but something that failed around it: an
//     interceptor that gave up (the user did not confirm a step-up challenge)
//     or a retry whose fetch rejected. Stamping the first response's status on
//     it would pass a network or CORS failure off as that 401.
export const attachResponseDetails = (error: unknown, response?: Response) => {
  if (!response || error instanceof Error) {
    return error;
  }
  const details = {
    response,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  };
  return error !== null && typeof error === 'object'
    ? { ...error, data: error, ...details }
    : { body: error, ...details };
};

client.interceptors.error.use(attachResponseDetails);

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

// A step-up challenge: the user is asked to confirm it is them and the
// request is sent again (./reauthentication). Registered before the sign-out
// below, which then sees the retry's response instead of the challenge.
client.interceptors.response.use(handleReauthenticationChallenge);

// A 401 means an authenticated session expired — hand off to the host's
// onSessionExpired (remember where to return, then log out). Guarded on this
// tab having had a session: an anonymous visitor (e.g. browsing the public
// marketplace) has no session to lose, and its 401s from authenticated-only
// endpoints — the matrix rooms poll, etc. — must not trigger a logout.
// `hadAuthenticatedSession` covers the case where the token was cleared
// out-of-band (logout in another tab) but this tab is still showing the
// authenticated UI.
//
// A step-up challenge is a 401 as well, but its session is fine: only the
// one change it refused fails, when the user does not confirm it is them.
export const handleUnauthorizedResponse = async (response: Response) => {
  const config = getAuthCoreConfig();
  if (
    response?.status === 401 &&
    (config.storage.token.get() || hadAuthenticatedSession) &&
    !LOGIN_ENDPOINT_PATHS.some(
      (path) => response.url === config.getApiEndpoint() + path,
    ) &&
    !(await readReauthenticationChallenge(response))
  ) {
    config.onSessionExpired();
  }
  return response;
};

client.interceptors.response.use(handleUnauthorizedResponse);

// While a demo preset loads, the backend pauses its API: every request but
// the status, configuration and login endpoints answers 503 with
// `demo_reset: true`. Other 503s (a proxy, a worker restart) carry no such
// body and are left alone. The body is read from a clone, so the caller still
// gets it whole.
export const handleDemoResetResponse = async (response: Response) => {
  if (response?.status !== 503) {
    return response;
  }
  const { onDemoReset } = getAuthCoreConfig();
  if (!onDemoReset) {
    return response;
  }
  try {
    const body = await response.clone().json();
    if (body?.demo_reset === true) {
      onDemoReset(typeof body.preset === 'string' ? body.preset : '');
    }
  } catch {
    // Not JSON: not the demo reset.
  }
  return response;
};

client.interceptors.response.use(handleDemoResetResponse);
client.interceptors.response.use(addApiErrorBreadcrumb);

/**
 * Generic GET request helper using native fetch.
 * Handles both JSON and binary (blob) responses automatically based on content type.
 * @param endpoint The API endpoint to fetch.
 * @param signal Aborts the request.
 * @returns Typed result or Blob.
 */
export async function get<T = any>(
  endpoint: string,
  signal?: AbortSignal,
): Promise<T> {
  const config = getAuthCoreConfig();
  const response = await fetch(
    fixURL(endpoint),
    config.storage.token.get()
      ? {
          headers: { Authorization: getAuthHeader() },
          signal,
        }
      : { signal },
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
