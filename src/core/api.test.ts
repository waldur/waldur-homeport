import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { AuthMethodStorage, AuthTokenStorage } from '@/core/StorageManager';

import { attachAuthHeader, getAllPages, getAuthHeader } from './api';

// Node 25 ships an experimental top-level `localStorage` that conflicts
// with the one provided by jsdom; stub a plain in-memory shim so
// AuthTokenStorage / AuthMethodStorage behave deterministically.
const installMemoryStorage = () => {
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (i) => Array.from(store.keys())[i] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
  vi.stubGlobal('localStorage', shim);
};

describe('getAuthHeader', () => {
  let savedPlugins: any;

  beforeEach(() => {
    installMemoryStorage();
    savedPlugins = (ENV as any).plugins;
    localStorage.clear();
  });

  afterEach(() => {
    (ENV as any).plugins = savedPlugins;
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('does not throw while bootstrapping an OIDC session before the server configuration is loaded', () => {
    // Reproduces the "unable to bootstrap application" crash for myAccessID
    // users: after the OIDC redirect the page reloads with a token already in
    // storage and a non-local auth method, but the `configurationRetrieve`
    // bootstrap request runs *before* ENV.plugins is populated.
    delete (ENV as any).plugins;
    AuthMethodStorage.set('eduteams');
    AuthTokenStorage.set('oidc-jwt');

    expect(() => getAuthHeader()).not.toThrow();
    expect(getAuthHeader()).toContain('oidc-jwt');
  });

  it('returns a Token-prefixed header for local accounts', () => {
    delete (ENV as any).plugins;
    AuthMethodStorage.set('local');
    AuthTokenStorage.set('local-key');

    expect(getAuthHeader()).toBe('Token local-key');
  });

  it('returns a Bearer-prefixed header for OIDC accounts once OIDC access tokens are enabled', () => {
    (ENV as any).plugins = {
      WALDUR_CORE: { OIDC_ACCESS_TOKEN_ENABLED: true },
    };
    AuthMethodStorage.set('eduteams');
    AuthTokenStorage.set('oidc-jwt');

    expect(getAuthHeader()).toBe('Bearer oidc-jwt');
  });

  it('returns undefined when there is no token', () => {
    AuthMethodStorage.set('local');

    expect(getAuthHeader()).toBeUndefined();
  });
});

// attachAuthHeader skips header attachment while ENV.plugins is unset, so the
// bootstrap request — which fires before the configuration is loaded — never
// carries an Authorization header, even when a token is already in storage.
describe('attachAuthHeader — bootstrap skip', () => {
  let savedPlugins: any;

  beforeEach(() => {
    installMemoryStorage();
    savedPlugins = (ENV as any).plugins;
  });

  afterEach(() => {
    (ENV as any).plugins = savedPlugins;
    vi.unstubAllGlobals();
  });

  const run = () =>
    attachAuthHeader(new Request('http://localhost:8080/api/configuration/'));

  it('skips while bootstrapping an OIDC session (no Authorization header)', () => {
    delete (ENV as any).plugins;
    AuthMethodStorage.set('eduteams');
    AuthTokenStorage.set('oidc-jwt');
    expect(run().headers.get('Authorization')).toBeNull();
  });

  it('skips while bootstrapping a local-auth session (no Authorization header)', () => {
    delete (ENV as any).plugins;
    AuthMethodStorage.set('local');
    AuthTokenStorage.set('local-key');
    expect(run().headers.get('Authorization')).toBeNull();
  });

  it('sets Bearer header once ENV.plugins is populated for an OIDC session', () => {
    (ENV as any).plugins = {
      WALDUR_CORE: { OIDC_ACCESS_TOKEN_ENABLED: true },
    };
    AuthMethodStorage.set('eduteams');
    AuthTokenStorage.set('oidc-jwt');
    expect(run().headers.get('Authorization')).toBe('Bearer oidc-jwt');
  });

  it('sets Token header once ENV.plugins is populated for a local-auth session', () => {
    (ENV as any).plugins = {
      WALDUR_CORE: { OIDC_ACCESS_TOKEN_ENABLED: true },
    };
    AuthMethodStorage.set('local');
    AuthTokenStorage.set('local-key');
    expect(run().headers.get('Authorization')).toBe('Token local-key');
  });
});

describe('getAllPages', () => {
  const createMockResponse = (
    data: any[],
    count: string | null,
    link: string | null,
  ) => {
    return {
      data,
      response: {
        headers: {
          get: (key: string) => {
            if (key === 'x-result-count') return count;
            if (key === 'link') return link;
            if (key === 'Link') return link;
            return null;
          },
        },
      },
    };
  };

  it('fetches a single page of results seamlessly', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue(createMockResponse([{ id: 1 }, { id: 2 }], '2', null));
    const results = await getAllPages(fetchPage);

    expect(results).toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(1);
  });

  it('fetches multiple pages recursively tracking the link header', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse(
          [{ id: 1 }],
          '3',
          '<https://api/v1/?page=2>; rel="next"',
        ),
      )
      .mockResolvedValueOnce(
        createMockResponse(
          [{ id: 2 }],
          '3',
          '<https://api/v1/?page=3>; rel="next"',
        ),
      )
      .mockResolvedValueOnce(createMockResponse([{ id: 3 }], '3', null));

    const results = await getAllPages(fetchPage);

    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 3);
  });

  it('calculates total pages accurately and triggers progress hooks', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse([1, 2], '5', '<url>; rel="next"'),
      )
      .mockResolvedValueOnce(
        createMockResponse([3, 4], '5', '<url>; rel="next"'),
      )
      .mockResolvedValueOnce(createMockResponse([5], '5', null));

    const onProgress = vi.fn();
    await getAllPages(fetchPage, onProgress);

    // Initial page size is 2. Math.ceil(5 / 2) = 3 total pages.
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 3);
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 3);
    // On the final page, size is 1 which changes math ceil bounds but loop breaks safely afterward
    expect(onProgress).toHaveBeenNthCalledWith(3, 3, 5);
  });

  it('handles empty results robustly', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue(createMockResponse([], '0', null));
    const results = await getAllPages(fetchPage);

    expect(results).toEqual([]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('handles missing header configurations gracefully', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue(createMockResponse([1, 2], null, null));
    const onProgress = vi.fn();
    await getAllPages(fetchPage, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(1, undefined);
  });
});
