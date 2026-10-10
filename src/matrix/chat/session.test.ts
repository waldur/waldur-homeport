import {
  createClient,
  HttpApiEvent,
  TokenRefreshError,
  TokenRefreshLogoutError,
} from 'matrix-js-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixSession } from 'waldur-js-client';

import {
  createTokenRefreshFunction,
  installTokenRefresh,
  withFreshAccessToken,
} from './session';

const matrixSessionMock = vi.mocked(matrixSession);

class LogoutError extends Error {}

const HOMESERVER = 'https://chat.example.com';
const NOW = new Date('2026-10-01T12:00:00Z').getTime();

const jsonResponse = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('createTokenRefreshFunction', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    matrixSessionMock.mockReset();
  });

  const refresh = () =>
    createTokenRefreshFunction(HOMESERVER, LogoutError as any);

  it('exchanges the refresh token through Matrix /refresh', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        access_token: 'access-2',
        refresh_token: 'refresh-2',
        expires_in_ms: 300000,
      }),
    );

    const tokens = await refresh()('refresh-1');

    expect(fetchMock).toHaveBeenCalledWith(
      `${HOMESERVER}/_matrix/client/v3/refresh`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refresh_token: 'refresh-1' }),
      }),
    );
    expect(tokens).toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      expiry: new Date(NOW + 300000),
    });
    expect(matrixSessionMock).not.toHaveBeenCalled();
  });

  it.each([401, 403])(
    'signs the client out when Matrix rejects the refresh with %i',
    async (status) => {
      fetchMock.mockResolvedValue(
        jsonResponse(status, {
          errcode: 'M_UNKNOWN_TOKEN',
          error: 'Refresh token has already been used.',
        }),
      );

      await expect(refresh()('refresh-1')).rejects.toBeInstanceOf(LogoutError);
      // A new session is a new device: the provider starts a new client for
      // it, instead of this one carrying on with another device's tokens.
      expect(matrixSessionMock).not.toHaveBeenCalled();
    },
  );

  it('retries later when the homeserver cannot be reached', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await refresh()('refresh-1').catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(LogoutError);
    expect(matrixSessionMock).not.toHaveBeenCalled();
  });

  it('retries later when the homeserver is overloaded', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(429, { errcode: 'M_LIMIT_EXCEEDED' }),
    );

    const error = await refresh()('refresh-1').catch((e) => e);

    expect(error).not.toBeInstanceOf(LogoutError);
    expect(matrixSessionMock).not.toHaveBeenCalled();
  });

  it('ignores a trailing slash on the homeserver URL', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { access_token: 'a', refresh_token: 'r' }),
    );

    await createTokenRefreshFunction(
      `${HOMESERVER}/`,
      LogoutError as any,
    )('refresh-1');

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${HOMESERVER}/_matrix/client/v3/refresh`,
    );
  });

  it('gives up on a refresh the homeserver never answers', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { access_token: 'a', refresh_token: 'r' }),
    );

    await refresh()('refresh-1');

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it('keeps the refresh token when the homeserver does not rotate it', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { access_token: 'access-2', expires_in_ms: 300000 }),
    );

    const tokens = await refresh()('refresh-1');

    expect(tokens.refreshToken).toBe('refresh-1');
  });

  it('omits the expiry when the homeserver returns none', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        access_token: 'access-2',
        refresh_token: 'refresh-2',
      }),
    );

    const tokens = await refresh()('refresh-1');

    expect(tokens.expiry).toBeUndefined();
  });
});

describe('withFreshAccessToken', () => {
  // The SDK renews its token only around its own requests, so a token read
  // just after expiry is stale until something authed goes out.
  const clientWith = (tokens: string[]) => {
    let current = tokens[0];
    return {
      getAccessToken: vi.fn(() => current),
      whoami: vi.fn(() => {
        current = tokens[1];
        return Promise.resolve({} as any);
      }),
    };
  };

  it('retries once with the renewed token after a 401 response', async () => {
    const client = clientWith(['old', 'new']);
    const run = vi.fn((token: string | null) =>
      Promise.resolve(
        new Response(null, { status: token === 'old' ? 401 : 200 }),
      ),
    );

    const response = await withFreshAccessToken(client, run);

    expect(response.status).toBe(200);
    expect(run.mock.calls.map(([token]) => token)).toEqual(['old', 'new']);
    expect(client.whoami).toHaveBeenCalledTimes(1);
  });

  it('retries once after a thrown 401, as from uploadContent', async () => {
    const client = clientWith(['old', 'new']);
    const run = vi
      .fn()
      .mockRejectedValueOnce({ httpStatus: 401, errcode: 'M_UNKNOWN_TOKEN' })
      .mockResolvedValueOnce('mxc://hs/x');

    await expect(withFreshAccessToken(client, run)).resolves.toBe('mxc://hs/x');
    expect(client.whoami).toHaveBeenCalledTimes(1);
  });

  it('leaves other failures alone', async () => {
    const client = clientWith(['old', 'new']);
    const abort = new DOMException('Aborted', 'AbortError');

    const response = await withFreshAccessToken(client, () =>
      Promise.resolve(new Response(null, { status: 500 })),
    );
    await expect(
      withFreshAccessToken(client, () => Promise.reject(abort)),
    ).rejects.toBe(abort);

    expect(response.status).toBe(500);
    expect(client.whoami).not.toHaveBeenCalled();
  });

  it('retries only once', async () => {
    const client = clientWith(['old', 'new']);
    const run = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 401 })),
    );

    const response = await withFreshAccessToken(client, run);

    expect(response.status).toBe(401);
    expect(run).toHaveBeenCalledTimes(2);
  });
});

// Against a real client, so an SDK upgrade that moves its token handling
// fails here rather than signing chats out every few minutes.
describe('installTokenRefresh', () => {
  const unknownToken = () =>
    jsonResponse(401, {
      errcode: 'M_UNKNOWN_TOKEN',
      error: 'Access token has expired',
      soft_logout: true,
    });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = (expiry?: Date, isActive?: () => boolean) => {
    const fetchFn = vi.fn();
    const client = createClient({
      baseUrl: HOMESERVER,
      userId: '@alice:example.com',
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      fetchFn,
    });
    const refresh = vi.fn();
    expect(
      installTokenRefresh(
        client,
        refresh,
        TokenRefreshLogoutError,
        expiry,
        isActive,
      ),
    ).toBe(true);
    const loggedOut = vi.fn();
    client.on(HttpApiEvent.SessionLoggedOut, loggedOut);
    const bearers = () =>
      fetchMock(fetchFn).map(([, init]) =>
        new Headers(init?.headers).get('Authorization'),
      );
    return { client, fetchFn, refresh, loggedOut, bearers };
  };
  const fetchMock = (fn: ReturnType<typeof vi.fn>) =>
    fn.mock.calls as [string, RequestInit | undefined][];

  const whoamiOk = () => jsonResponse(200, { user_id: '@alice:example.com' });

  it('refreshes an expired token and retries the request', async () => {
    const { client, fetchFn, refresh, loggedOut, bearers } = setup();
    fetchFn
      .mockResolvedValueOnce(unknownToken())
      .mockResolvedValueOnce(whoamiOk());
    refresh.mockResolvedValue({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });

    await client.whoami();

    expect(refresh).toHaveBeenCalledWith('refresh-1');
    expect(bearers()).toEqual(['Bearer access-1', 'Bearer access-2']);
    expect(client.getAccessToken()).toBe('access-2');
    expect(client.getRefreshToken()).toBe('refresh-2');
    expect(loggedOut).not.toHaveBeenCalled();
  });

  it('shares one refresh between concurrent requests', async () => {
    const { client, fetchFn, refresh, bearers } = setup();
    fetchFn
      .mockResolvedValueOnce(unknownToken())
      .mockResolvedValueOnce(unknownToken())
      .mockImplementation(() => Promise.resolve(whoamiOk()));
    refresh.mockResolvedValue({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });

    await Promise.all([client.whoami(), client.whoami()]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(bearers().slice(2)).toEqual(['Bearer access-2', 'Bearer access-2']);
  });

  it('does not refresh for a discarded client', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    let active = true;
    const { client, fetchFn, refresh } = setup(undefined, () => active);
    fetchFn.mockImplementation(() => Promise.resolve(unknownToken()));
    refresh.mockResolvedValue({ accessToken: 'access-2', refreshToken: 'r' });

    const request = client.whoami();
    const outcome = expect(request).rejects.toMatchObject({
      errcode: 'M_UNKNOWN_TOKEN',
    });
    await vi.advanceTimersByTimeAsync(0);
    active = false;
    await vi.runAllTimersAsync();
    await outcome;

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes before a request once the token is due', async () => {
    const { client, fetchFn, refresh, bearers } = setup(
      new Date(Date.now() - 1000),
    );
    fetchFn.mockImplementation(() => Promise.resolve(whoamiOk()));
    refresh.mockResolvedValue({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      expiry: new Date(Date.now() + 300000),
    });

    await client.whoami();
    await client.whoami();

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(bearers()).toEqual(['Bearer access-2', 'Bearer access-2']);
  });

  it('signs the client out when Matrix rejects the refresh', async () => {
    const { client, fetchFn, refresh, loggedOut } = setup();
    fetchFn.mockResolvedValue(unknownToken());
    refresh.mockRejectedValue(
      new TokenRefreshLogoutError(new Error('rejected')),
    );

    await expect(client.whoami()).rejects.toMatchObject({
      errcode: 'M_UNKNOWN_TOKEN',
    });
    expect(loggedOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the refresh fails for another reason', async () => {
    const { client, fetchFn, refresh, loggedOut } = setup();
    fetchFn.mockResolvedValue(unknownToken());
    refresh.mockRejectedValue(new Error('network down'));

    await expect(client.whoami()).rejects.toBeInstanceOf(TokenRefreshError);
    expect(loggedOut).not.toHaveBeenCalled();
    expect(client.getRefreshToken()).toBe('refresh-1');
  });

  it('signs out a token rejected long before its expiry', async () => {
    const { client, fetchFn, refresh, loggedOut } = setup(
      new Date(Date.now() + 300000),
    );
    fetchFn.mockResolvedValue(unknownToken());

    await expect(client.whoami()).rejects.toMatchObject({
      errcode: 'M_UNKNOWN_TOKEN',
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(loggedOut).toHaveBeenCalledTimes(1);
  });

  it('signs out a request refused after every refresh', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    const { client, fetchFn, refresh, loggedOut } = setup();
    fetchFn.mockImplementation(() => Promise.resolve(unknownToken()));
    let n = 0;
    refresh.mockImplementation(() =>
      Promise.resolve({ accessToken: `access-${++n + 1}`, refreshToken: 'r' }),
    );

    const request = client.whoami();
    const outcome = expect(request).rejects.toMatchObject({
      errcode: 'M_UNKNOWN_TOKEN',
    });
    await vi.runAllTimersAsync();
    await outcome;

    expect(refresh).toHaveBeenCalledTimes(5);
    expect(loggedOut).toHaveBeenCalledTimes(1);
  });

  it('reports a client without the token manager', () => {
    expect(
      installTokenRefresh(
        { http: {} } as any,
        vi.fn(),
        TokenRefreshLogoutError,
        undefined,
      ),
    ).toBe(false);
  });
});
