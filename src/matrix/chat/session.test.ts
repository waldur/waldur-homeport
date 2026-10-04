import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixSession } from 'waldur-js-client';

import { createTokenRefreshFunction, withFreshAccessToken } from './session';

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

  it('starts a new Waldur session when Matrix rejects the refresh', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, {
        errcode: 'M_UNKNOWN_TOKEN',
        error: 'Refresh token has already been used.',
      }),
    );
    const session = {
      device_id: 'WALDUR_WEB_NEW',
      access_token: 'access-3',
      refresh_token: 'refresh-3',
      expires_in_ms: 300000,
    };
    matrixSessionMock.mockResolvedValue({ data: session } as any);

    const tokens = await refresh()('refresh-1');

    expect(tokens).toEqual({
      accessToken: 'access-3',
      refreshToken: 'refresh-3',
      expiry: new Date(NOW + 300000),
    });
  });

  it.each([401, 403, 404])(
    'ends the session when Waldur refuses a new one with %i',
    async (status) => {
      fetchMock.mockResolvedValue(
        jsonResponse(403, { errcode: 'M_FORBIDDEN', error: 'unrecognized' }),
      );
      matrixSessionMock.mockRejectedValue({
        detail: 'Not authenticated.',
        response: { status },
      });

      await expect(refresh()('refresh-1')).rejects.toBeInstanceOf(LogoutError);
    },
  );

  it('retries later when Waldur cannot start a session right now', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { errcode: 'M_UNKNOWN_TOKEN', error: 'expired' }),
    );
    const throttled = {
      detail: 'Request was throttled.',
      response: { status: 429 },
    };
    matrixSessionMock.mockRejectedValue(throttled);

    const error = await refresh()('refresh-1').catch((e) => e);

    // Anything but the SDK's logout error leaves the session to be retried.
    expect(error).toBe(throttled);
    expect(error).not.toBeInstanceOf(LogoutError);
  });

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
