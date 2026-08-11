import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  attachAuthHeader,
  getAuthHeader,
  handleUnauthorizedResponse,
  resetAuthSessionTracking,
} from './client';
import { configureAuthCore } from './config';

const makeStorage = (initial: string | null = null) => {
  let value = initial;
  return {
    get: () => value,
    set: (v: string) => {
      value = v;
    },
    remove: () => {
      value = null;
    },
  };
};

const onSessionExpired = vi.fn();

let tokenStorage: ReturnType<typeof makeStorage>;
let methodStorage: ReturnType<typeof makeStorage>;
let configLoaded: boolean;
let oidcEnabled: boolean;

beforeEach(() => {
  tokenStorage = makeStorage();
  methodStorage = makeStorage();
  configLoaded = false;
  oidcEnabled = false;
  onSessionExpired.mockClear();
  resetAuthSessionTracking();

  configureAuthCore({
    storage: {
      token: tokenStorage,
      method: methodStorage,
      impersonation: makeStorage(),
      language: makeStorage(),
    },
    getApiEndpoint: () => 'http://localhost:8080/',
    isConfigLoaded: () => configLoaded,
    isOidcAccessTokenEnabled: () => oidcEnabled,
    onSessionExpired,
  });
});

describe('getAuthHeader', () => {
  it('does not throw while bootstrapping an OIDC session before the server configuration is loaded', () => {
    // Reproduces the "unable to bootstrap application" crash for myAccessID
    // users: after the OIDC redirect the page reloads with a token already in
    // storage and a non-local auth method, but the `configurationRetrieve`
    // bootstrap request runs *before* isConfigLoaded() is true.
    methodStorage.set('eduteams');
    tokenStorage.set('oidc-jwt');

    expect(() => getAuthHeader()).not.toThrow();
    expect(getAuthHeader()).toContain('oidc-jwt');
  });

  it('returns a Token-prefixed header for local accounts', () => {
    methodStorage.set('local');
    tokenStorage.set('local-key');

    expect(getAuthHeader()).toBe('Token local-key');
  });

  it('returns a Bearer-prefixed header for OIDC accounts once OIDC access tokens are enabled', () => {
    configLoaded = true;
    oidcEnabled = true;
    methodStorage.set('eduteams');
    tokenStorage.set('oidc-jwt');

    expect(getAuthHeader()).toBe('Bearer oidc-jwt');
  });

  it('returns undefined when there is no token', () => {
    methodStorage.set('local');

    expect(getAuthHeader()).toBeUndefined();
  });
});

// attachAuthHeader skips header attachment while config isn't loaded, so the
// bootstrap request — which fires before the configuration is loaded — never
// carries an Authorization header, even when a token is already in storage.
describe('attachAuthHeader — bootstrap skip', () => {
  const run = () =>
    attachAuthHeader(new Request('http://localhost:8080/api/configuration/'));

  it('skips while bootstrapping an OIDC session (no Authorization header)', () => {
    methodStorage.set('eduteams');
    tokenStorage.set('oidc-jwt');
    expect(run().headers.get('Authorization')).toBeNull();
  });

  it('skips while bootstrapping a local-auth session (no Authorization header)', () => {
    methodStorage.set('local');
    tokenStorage.set('local-key');
    expect(run().headers.get('Authorization')).toBeNull();
  });

  it('sets Bearer header once config is loaded for an OIDC session', () => {
    configLoaded = true;
    oidcEnabled = true;
    methodStorage.set('eduteams');
    tokenStorage.set('oidc-jwt');
    expect(run().headers.get('Authorization')).toBe('Bearer oidc-jwt');
  });

  it('sets Token header once config is loaded for a local-auth session', () => {
    configLoaded = true;
    oidcEnabled = true;
    methodStorage.set('local');
    tokenStorage.set('local-key');
    expect(run().headers.get('Authorization')).toBe('Token local-key');
  });
});

describe('handleUnauthorizedResponse — 401 logout guard', () => {
  const resp401 = () =>
    ({
      status: 401,
      url: 'http://localhost:8080/api/matrix/rooms/?member=true',
    }) as unknown as Response;

  it('does not log out an anonymous visitor (no token) on a 401', () => {
    handleUnauthorizedResponse(resp401());
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('logs out an authenticated user (token present) on a 401', () => {
    tokenStorage.set('local-key');
    handleUnauthorizedResponse(resp401());
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('logs out a stale authenticated tab whose token was cleared out-of-band', () => {
    // This tab made an authenticated request (sets the in-memory flag)...
    configLoaded = true;
    oidcEnabled = true;
    methodStorage.set('eduteams');
    tokenStorage.set('oidc-jwt');
    attachAuthHeader(new Request('http://localhost:8080/api/projects/'));
    // ...then a logout in another tab cleared the shared token.
    tokenStorage.remove();

    handleUnauthorizedResponse(resp401());
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('does not log out on a 401 from the login endpoint itself', () => {
    tokenStorage.set('local-key');
    handleUnauthorizedResponse({
      status: 401,
      url: 'http://localhost:8080/api-auth/password/',
    } as unknown as Response);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});
