import type {
  AccessTokens,
  MatrixClient,
  TokenRefreshLogoutError,
} from 'matrix-js-sdk';
import {
  MatrixSession,
  matrixRoomsOpen,
  matrixSession,
} from 'waldur-js-client';

// Waldur answers these when there is no session to give: signed out of Waldur,
// account deactivated, or chat switched off. Anything else is worth retrying.
const SESSION_REFUSED = [401, 403, 404];
// Matrix answers these for a refresh token it will not exchange (expired,
// already used, or its device signed out). A fresh Waldur session recovers.
const REFRESH_REJECTED = [401, 403];
// While a refresh is pending the SDK holds every other request behind it, so
// a refresh the homeserver never answers would freeze the whole client.
const REQUEST_TIMEOUT_MS = 15_000;

// The SDK's error interceptor attaches the Response to the thrown body.
const httpStatus = (error: unknown): number | undefined =>
  (error as any)?.response?.status ?? (error as any)?.status;

const toTokens = (
  accessToken: string,
  refreshToken: string | null | undefined,
  expiresInMs: number | null | undefined,
): AccessTokens => ({
  accessToken,
  refreshToken: refreshToken ?? undefined,
  expiry: expiresInMs ? new Date(Date.now() + expiresInMs) : undefined,
});

export const sessionTokens = (session: MatrixSession): AccessTokens =>
  toTokens(session.access_token, session.refresh_token, session.expires_in_ms);

/**
 * Start a web chat session. Resolves null when Waldur refuses one for good
 * and throws on errors worth retrying.
 */
export const startSession = async (): Promise<MatrixSession | null> => {
  try {
    return (
      await matrixSession({ signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    ).data;
  } catch (error) {
    if (SESSION_REFUSED.includes(httpStatus(error))) return null;
    throw error;
  }
};

/**
 * Resolve the Matrix room ID, accepting a pending invite on the way. Resolves
 * null when the caller may see the room but not read its conversation.
 */
export const openRoom = async (roomUuid: string): Promise<string | null> => {
  try {
    return (await matrixRoomsOpen({ path: { uuid: roomUuid } })).data.room_id;
  } catch (error) {
    if ([403, 404].includes(httpStatus(error))) return null;
    throw error;
  }
};

/**
 * Build matrix-js-sdk's tokenRefreshFunction. It exchanges the refresh token
 * with a plain fetch, because client.refreshToken() would wait on the very
 * refresh in progress. A rejected exchange throws `LogoutError` (the SDK's
 * TokenRefreshLogoutError), which signs the client out; the provider then asks
 * Waldur for a new session on a new client. A new session is a new device, and
 * a client's end-to-end encryption belongs to its device, so the old client
 * can't carry on with new tokens. Any other error fails the request that
 * needed the refresh, and the sync loop tries again later.
 */
export const createTokenRefreshFunction =
  (homeserverUrl: string, LogoutError: typeof TokenRefreshLogoutError) =>
  async (refreshToken: string): Promise<AccessTokens> => {
    // The SDK strips a trailing slash from its base URL; match it.
    const base = homeserverUrl.replace(/\/+$/, '');
    const response = await fetch(`${base}/_matrix/client/v3/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.ok) {
      const body = await response.json();
      // A homeserver that does not rotate refresh tokens leaves it out.
      return toTokens(
        body.access_token,
        body.refresh_token ?? refreshToken,
        body.expires_in_ms,
      );
    }
    if (!REFRESH_REJECTED.includes(response.status)) {
      throw new Error(`Matrix token refresh failed with ${response.status}`);
    }
    throw new LogoutError(
      new Error(`Matrix rejected the refresh token with ${response.status}.`),
    );
  };

const isUnauthorized = (outcome: unknown) =>
  httpStatus(outcome) === 401 || (outcome as any)?.httpStatus === 401;

/**
 * Run a request that sends the access token itself instead of going through
 * the SDK, such as a media download or uploadContent's XHR. The SDK renews an
 * expired token only around its own requests, so a token read just after
 * expiry is stale; on a 401, whoami() makes the SDK renew it and the request
 * runs once more.
 */
export const withFreshAccessToken = async <T>(
  client: Pick<MatrixClient, 'getAccessToken' | 'whoami'>,
  run: (accessToken: string | null) => Promise<T>,
): Promise<T> => {
  try {
    const result = await run(client.getAccessToken());
    if (!isUnauthorized(result)) return result;
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
  }
  await client.whoami();
  return run(client.getAccessToken());
};
