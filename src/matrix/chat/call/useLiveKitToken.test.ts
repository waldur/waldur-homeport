import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readLiveKitCredentials, useLiveKitToken } from './useLiveKitToken';

const openIdToken = {
  access_token: 'openid-secret',
  token_type: 'Bearer',
  matrix_server_name: 'hs.test',
  expires_in: 3600,
};

vi.mock('../useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: {
      getHomeserverUrl: () => 'https://hs.test',
      getOpenIdToken: () => Promise.resolve(openIdToken),
      getUserId: () => '@me:hs.test',
      getDeviceId: () => 'WALDURDEV1',
    },
  }),
}));

const wellKnown = {
  ok: true,
  json: () =>
    Promise.resolve({
      'org.matrix.msc4143.rtc_foci': [
        { type: 'livekit', livekit_service_url: 'https://lk.test' },
      ],
    }),
};
const tokenResponse = {
  ok: true,
  status: 200,
  json: () => Promise.resolve({ url: 'wss://lk.test/sfu', jwt: 'jwt' }),
};

describe('useLiveKitToken', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('asks /sfu/get as Element Call does, so both share one LiveKit room', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(wellKnown)
      .mockResolvedValueOnce(tokenResponse);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLiveKitToken());
    let credentials;
    await act(async () => {
      credentials = await result.current.acquireToken('!room:hs.test');
    });

    expect(credentials).toEqual({ url: 'wss://lk.test/sfu', jwt: 'jwt' });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toMatch(/\/sfu\/get$/);
    expect(JSON.parse(init.body)).toEqual({
      room: '!room:hs.test',
      openid_token: openIdToken,
      device_id: 'WALDURDEV1',
    });
  });

  it('falls back to /get_token for slot m.call#ROOM without the legacy endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(wellKnown)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce(tokenResponse);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLiveKitToken());
    let credentials;
    await act(async () => {
      credentials = await result.current.acquireToken('!room:hs.test');
    });

    expect(credentials).toEqual({ url: 'wss://lk.test/sfu', jwt: 'jwt' });
    const [url, init] = fetchMock.mock.calls[2];
    expect(url).toMatch(/\/get_token$/);
    expect(JSON.parse(init.body)).toMatchObject({
      room_id: '!room:hs.test',
      slot_id: 'm.call#ROOM',
      openid_token: openIdToken,
      member: {
        id: '@me:hs.test:WALDURDEV1',
        claimed_user_id: '@me:hs.test',
        claimed_device_id: 'WALDURDEV1',
      },
    });
  });

  describe('for an encrypted call', () => {
    // A LiveKit token whose participant identity is `sub`.
    const jwtFor = (sub: string) =>
      `h.${btoa(JSON.stringify({ sub })).replace(/=+$/, '')}.s`;
    const tokenFor = (sub: string) => ({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ url: 'wss://lk.test/sfu', jwt: jwtFor(sub) }),
    });
    const acquire = async (fetchMock: ReturnType<typeof vi.fn>) => {
      vi.stubGlobal('fetch', fetchMock);
      const { result } = renderHook(() => useLiveKitToken());
      let credentials;
      await act(async () => {
        credentials = await result.current.acquireToken('!room:hs.test', null, {
          encrypted: true,
        });
      });
      return credentials;
    };

    it('joins under the identity its media keys are bound to', async () => {
      const credentials = await acquire(
        vi
          .fn()
          .mockResolvedValueOnce(wellKnown)
          .mockResolvedValueOnce(tokenFor('@me:hs.test:WALDURDEV1')),
      );
      expect(credentials).toEqual({
        url: 'wss://lk.test/sfu',
        jwt: jwtFor('@me:hs.test:WALDURDEV1'),
      });
    });

    it('refuses a token for another identity', async () => {
      const credentials = await acquire(
        vi
          .fn()
          .mockResolvedValueOnce(wellKnown)
          .mockResolvedValueOnce(tokenFor('9f2c1e')),
      );
      expect(credentials).toBeNull();
    });

    it('does not fall back to /get_token', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(wellKnown)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: () => Promise.resolve(''),
        });
      expect(await acquire(fetchMock)).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('advertises the focus as the homeserver names it, aliased to the room', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(wellKnown));
    const { result } = renderHook(() => useLiveKitToken());
    let focus;
    await act(async () => {
      focus = await result.current.getFocus('!room:hs.test');
    });
    expect(focus).toEqual({
      type: 'livekit',
      livekit_service_url: 'https://lk.test',
      livekit_alias: '!room:hs.test',
    });
  });

  it('never sends the OpenID token to a focus that is not ours', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(wellKnown)
      .mockResolvedValueOnce(tokenResponse);
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useLiveKitToken());
    await act(async () => {
      await result.current.acquireToken('!room:hs.test', {
        type: 'livekit',
        livekit_service_url: 'https://evil.test/',
        livekit_alias: '!room:hs.test',
      });
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://lk.test/sfu/get');
    for (const [url] of fetchMock.mock.calls) {
      expect(String(url)).not.toContain('evil.test');
    }
  });

  describe('outside dev', () => {
    beforeEach(() => vi.stubEnv('DEV', false));
    afterEach(() => vi.unstubAllEnvs());

    const twoFoci = {
      ok: true,
      json: () =>
        Promise.resolve({
          'org.matrix.msc4143.rtc_foci': [
            { type: 'livekit', livekit_service_url: 'https://lk.test' },
            { type: 'livekit', livekit_service_url: 'https://lk2.test/jwt/' },
          ],
        }),
    };

    const requestUrlFor = async (focusUrl: string) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(twoFoci)
        .mockResolvedValueOnce(tokenResponse);
      vi.stubGlobal('fetch', fetchMock);
      const { result } = renderHook(() => useLiveKitToken());
      let credentials;
      await act(async () => {
        credentials = await result.current.acquireToken('!room:hs.test', {
          type: 'livekit',
          livekit_service_url: focusUrl,
          livekit_alias: '!room:hs.test',
        });
      });
      expect(credentials).toEqual({ url: 'wss://lk.test/sfu', jwt: 'jwt' });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      return fetchMock.mock.calls[1][0];
    };

    it("follows the oldest member's focus when it is one of ours", async () => {
      expect(await requestUrlFor('https://LK2.test/jwt')).toBe(
        'https://lk2.test/jwt/sfu/get',
      );
    });

    it('uses our own service for a focus that only looks like ours', async () => {
      for (const url of [
        'https://evil.test',
        'https://lk.test.evil.test',
        'https://lk.test@evil.test',
        'https:\\\\evil.test',
        'https://lk2.test/jwt/../other',
        'https://lk2.test/other',
        'https://lk2.test:8443/jwt',
        'http://lk.test',
        '/sfu',
      ]) {
        expect(await requestUrlFor(url)).toBe('https://lk.test/sfu/get');
      }
    });
  });

  describe('with VITE_LK_JWT_URL in dev', () => {
    beforeEach(() =>
      vi.stubEnv(
        'VITE_LK_JWT_URL',
        'http://localhost:10790/api/matrix/livekit/',
      ),
    );
    afterEach(() => vi.unstubAllEnvs());

    const requestUrlFor = async (focusUrl?: string) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(wellKnown)
        .mockResolvedValueOnce(tokenResponse);
      vi.stubGlobal('fetch', fetchMock);
      const { result } = renderHook(() => useLiveKitToken());
      await act(async () => {
        await result.current.acquireToken(
          '!room:hs.test',
          focusUrl
            ? {
                type: 'livekit',
                livekit_service_url: focusUrl,
                livekit_alias: '!room:hs.test',
              }
            : null,
        );
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      return fetchMock.mock.calls[1][0];
    };

    const devService = 'http://localhost:10790/api/matrix/livekit/sfu/get';

    it('calls it directly in place of the advertised service', async () => {
      expect(await requestUrlFor()).toBe(devService);
      expect(await requestUrlFor('https://lk.test')).toBe(devService);
      expect(
        await requestUrlFor('http://localhost:10790/api/matrix/livekit'),
      ).toBe(devService);
    });

    it('still never sends the OpenID token to another focus', async () => {
      expect(await requestUrlFor('https://evil.test')).toBe(devService);
    });

    it('keeps advertising the focus the homeserver names', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(wellKnown));
      const { result } = renderHook(() => useLiveKitToken());
      let focus;
      await act(async () => {
        focus = await result.current.getFocus('!room:hs.test');
      });
      expect(focus).toMatchObject({ livekit_service_url: 'https://lk.test' });
    });
  });

  describe('with VITE_LK_JWT_URL in a production build', () => {
    const devServiceUrl = 'http://localhost:10790/api/matrix/livekit';

    beforeEach(() => {
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_LK_JWT_URL', devServiceUrl);
    });
    afterEach(() => vi.unstubAllEnvs());

    it('ignores it and asks the advertised service', async () => {
      for (const focusUrl of [undefined, devServiceUrl]) {
        const fetchMock = vi
          .fn()
          .mockResolvedValueOnce(wellKnown)
          .mockResolvedValueOnce(tokenResponse);
        vi.stubGlobal('fetch', fetchMock);
        const { result } = renderHook(() => useLiveKitToken());
        let credentials;
        await act(async () => {
          credentials = await result.current.acquireToken(
            '!room:hs.test',
            focusUrl
              ? {
                  type: 'livekit',
                  livekit_service_url: focusUrl,
                  livekit_alias: '!room:hs.test',
                }
              : null,
          );
        });
        expect(credentials).toEqual({ url: 'wss://lk.test/sfu', jwt: 'jwt' });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][0]).toBe('https://lk.test/sfu/get');
        for (const [url] of fetchMock.mock.calls) {
          expect(String(url)).not.toContain('localhost:10790');
        }
      }
    });
  });

  it('rejects a token response that is not a LiveKit URL and token', async () => {
    for (const body of [
      { url: 'wss://lk.test/sfu', jwt: 42 },
      { url: 'https://lk.test/sfu', jwt: 'jwt' },
      { url: ['wss://lk.test/sfu'], jwt: 'jwt' },
      { jwt: 'jwt' },
    ]) {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(wellKnown)
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(body),
          }),
      );
      const { result } = renderHook(() => useLiveKitToken());
      let credentials;
      await act(async () => {
        credentials = await result.current.acquireToken('!room:hs.test');
      });
      expect(credentials).toBeNull();
    }
  });
});

describe('readLiveKitCredentials', () => {
  it('accepts wss:', () => {
    expect(
      readLiveKitCredentials({ url: 'wss://lk.test', jwt: 'jwt' }, false),
    ).toEqual({ url: 'wss://lk.test', jwt: 'jwt' });
  });

  it('accepts ws: only where insecure transport is allowed', () => {
    const data = { url: 'ws://localhost:7880', jwt: 'jwt' };
    expect(readLiveKitCredentials(data, true)).toEqual(data);
    expect(() => readLiveKitCredentials(data, false)).toThrow(
      /wss: is required/,
    );
  });

  it('rejects other schemes and malformed values', () => {
    expect(() =>
      readLiveKitCredentials({ url: 'https://lk.test', jwt: 'jwt' }, true),
    ).toThrow(/wss: is required/);
    expect(() =>
      readLiveKitCredentials({ url: 'not a url', jwt: 'jwt' }, true),
    ).toThrow(/invalid LiveKit URL/);
    expect(() =>
      readLiveKitCredentials({ url: 'wss://lk.test' }, true),
    ).toThrow(/no LiveKit token/);
    expect(() => readLiveKitCredentials(null, true)).toThrow();
  });
});
