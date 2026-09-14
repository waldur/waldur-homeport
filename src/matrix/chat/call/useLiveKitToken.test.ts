import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useLiveKitToken } from './useLiveKitToken';

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
    },
  }),
}));

describe('useLiveKitToken', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('exchanges the OpenID token at lk-jwt /get_token with the SFURequest body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            'org.matrix.msc4143.rtc_foci': [
              { type: 'livekit', livekit_service_url: 'https://lk.test' },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'wss://lk.test/sfu', jwt: 'jwt' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useLiveKitToken());
    let credentials;
    await act(async () => {
      credentials = await result.current.acquireToken('!room:hs.test');
    });

    expect(credentials).toEqual({ url: 'wss://lk.test/sfu', jwt: 'jwt' });
    const [url, init] = fetchMock.mock.calls[1];
    // lk-jwt serves the SFURequest shape (room_id/slot_id/member) only on
    // /get_token; /sfu/get is the legacy endpoint and rejects it from 0.6.0.
    expect(url).toMatch(/\/get_token$/);
    expect(JSON.parse(init.body)).toMatchObject({
      room_id: '!room:hs.test',
      slot_id: '0',
      openid_token: openIdToken,
      member: { claimed_user_id: '@me:hs.test' },
    });
  });
});
