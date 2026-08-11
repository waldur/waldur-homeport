import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiAuthPassword, apiAuthTokenExchange } from 'waldur-js-client';

vi.mock('waldur-js-client/client.gen', () => ({
  client: { setConfig: vi.fn(), interceptors: hoistedInterceptors() },
}));

// client.ts registers interceptors at module-eval time; give it something
// that accepts `.use()` without doing anything.
function hoistedInterceptors() {
  const noop = { use: vi.fn() };
  return { request: noop, response: noop, error: noop };
}

import {
  clearAuthTokens,
  exchangeToken,
  isAuthenticated,
  loginUser,
  signin,
  signinByToken,
} from './authService';
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

let tokenStorage: ReturnType<typeof makeStorage>;
let methodStorage: ReturnType<typeof makeStorage>;
let onLogin: ReturnType<typeof vi.fn> | undefined;

const setup = () => {
  tokenStorage = makeStorage();
  methodStorage = makeStorage();
  configureAuthCore({
    storage: {
      token: tokenStorage,
      method: methodStorage,
      impersonation: makeStorage(),
      language: makeStorage(),
    },
    getApiEndpoint: () => 'http://localhost:8080/',
    isConfigLoaded: () => true,
    isOidcAccessTokenEnabled: () => false,
    onSessionExpired: vi.fn(),
    onLogin,
  });
};

beforeEach(() => {
  onLogin = undefined;
  vi.clearAllMocks();
});

describe('loginUser', () => {
  it('stores the token and method', async () => {
    setup();
    await loginUser('tok-123', 'local');

    expect(tokenStorage.get()).toBe('tok-123');
    expect(methodStorage.get()).toBe('local');
  });

  it('calls the configured onLogin hook', async () => {
    onLogin = vi.fn();
    setup();

    await loginUser('tok-123', 'local');

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('does not throw when onLogin is not configured', async () => {
    setup();
    await expect(loginUser('tok-123', 'local')).resolves.toBeUndefined();
  });
});

describe('isAuthenticated', () => {
  it('reflects whether a token is stored', async () => {
    setup();
    expect(isAuthenticated()).toBe(false);

    await loginUser('tok-123', 'local');
    expect(isAuthenticated()).toBe(true);
  });
});

describe('clearAuthTokens', () => {
  it('removes both the token and the method', async () => {
    setup();
    await loginUser('tok-123', 'local');

    clearAuthTokens();

    expect(tokenStorage.get()).toBeNull();
    expect(methodStorage.get()).toBeNull();
  });
});

describe('signinByToken', () => {
  it('logs the user in with the given token', async () => {
    setup();
    await signinByToken('tok-456');

    expect(tokenStorage.get()).toBe('tok-456');
    expect(methodStorage.get()).toBe('local');
  });
});

describe('signin', () => {
  it('exchanges credentials for a token and logs in', async () => {
    setup();
    vi.mocked(apiAuthPassword).mockResolvedValue({
      data: { token: 'tok-789' },
    } as any);

    await signin('alice', 'hunter2');

    expect(apiAuthPassword).toHaveBeenCalledWith({
      body: { username: 'alice', password: 'hunter2' },
    });
    expect(tokenStorage.get()).toBe('tok-789');
    expect(methodStorage.get()).toBe('local');
  });
});

describe('exchangeToken', () => {
  it('returns the token from the SDK response', async () => {
    vi.mocked(apiAuthTokenExchange).mockResolvedValue({
      data: { token: 'exchanged-tok' },
    } as any);

    const token = await exchangeToken('oauth-code');

    expect(apiAuthTokenExchange).toHaveBeenCalledWith({
      body: { code: 'oauth-code' },
    });
    expect(token).toBe('exchanged-tok');
  });
});
