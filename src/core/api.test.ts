import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { localLogout } from '@/auth/authNavigation';
import { ENV } from '@/core/config';
import { AuthMethodStorage, AuthTokenStorage } from '@/core/StorageManager';

import {
  attachAuthHeader,
  getAuthHeader,
  handleUnauthorizedResponse,
  resetAuthSessionTracking,
} from './api';

// `@/router` is globally mocked (test/mocks/router.js); only authNavigation needs a
// local mock so we can assert on localLogout.
vi.mock('@/auth/authNavigation', () => ({ localLogout: vi.fn() }));

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

describe('handleUnauthorizedResponse — 401 logout guard', () => {
  let savedPlugins: any;

  const resp401 = () =>
    ({
      status: 401,
      url: 'http://localhost:8080/api/matrix/rooms/?member=true',
    }) as unknown as Response;

  beforeEach(() => {
    installMemoryStorage();
    localStorage.clear();
    // The in-memory "tab was authenticated" flag lives on the shared module and
    // would otherwise leak from earlier attachAuthHeader tests into these cases.
    resetAuthSessionTracking();
    savedPlugins = (ENV as any).plugins;
    vi.mocked(localLogout).mockClear();
  });

  afterEach(() => {
    (ENV as any).plugins = savedPlugins;
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('does not log out an anonymous visitor (no token) on a 401', () => {
    handleUnauthorizedResponse(resp401());
    expect(localLogout).not.toHaveBeenCalled();
  });

  it('logs out an authenticated user (token present) on a 401', () => {
    AuthTokenStorage.set('local-key');
    handleUnauthorizedResponse(resp401());
    expect(localLogout).toHaveBeenCalledTimes(1);
  });

  it('logs out a stale authenticated tab whose token was cleared out-of-band', () => {
    // This tab made an authenticated request (sets the in-memory flag)...
    (ENV as any).plugins = {
      WALDUR_CORE: { OIDC_ACCESS_TOKEN_ENABLED: true },
    };
    AuthMethodStorage.set('eduteams');
    AuthTokenStorage.set('oidc-jwt');
    attachAuthHeader(new Request('http://localhost:8080/api/projects/'));
    // ...then a logout in another tab cleared the shared token.
    AuthTokenStorage.remove();

    handleUnauthorizedResponse(resp401());
    expect(localLogout).toHaveBeenCalledTimes(1);
  });
});
