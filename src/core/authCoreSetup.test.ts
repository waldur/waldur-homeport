import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configureAuthCore } from 'waldur-auth-core';

import { localLogout } from '@/auth/authNavigation';
import { resetSessionState } from '@/auth/sessionReset';
import { UsersService } from '@/user/UsersService';

vi.mock('waldur-auth-core', () => ({ configureAuthCore: vi.fn() }));
// `@/router` is globally mocked (test/mocks/router.js); only authNavigation
// needs a local mock so we can assert on localLogout.
vi.mock('@/auth/authNavigation', () => ({ localLogout: vi.fn() }));
vi.mock('@/auth/sessionReset', () => ({ resetSessionState: vi.fn() }));
vi.mock('@/user/UsersService', () => ({
  UsersService: { refreshCurrentUser: vi.fn() },
}));

// Node 25 ships an experimental top-level `localStorage` that conflicts with
// jsdom's; onSessionExpired writes the redirect target there, so give it a
// plain in-memory shim (mirrors src/auth/authNavigation.test.ts).
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

describe('setupAuthCore', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    installMemoryStorage();
    vi.mocked(configureAuthCore).mockClear();
    vi.mocked(localLogout).mockClear();
    vi.mocked(resetSessionState).mockClear();
    vi.mocked(UsersService.refreshCurrentUser).mockClear();
  });

  it('wires onSessionExpired to log out via authNavigation', async () => {
    const { setupAuthCore } = await import('./authCoreSetup');
    setupAuthCore();

    const config = vi.mocked(configureAuthCore).mock.calls[0][0];
    config.onSessionExpired();

    expect(localLogout).toHaveBeenCalledTimes(1);
  });

  it('wires onLogin to reset the session and then load the new user', async () => {
    const { setupAuthCore } = await import('./authCoreSetup');
    setupAuthCore();

    const config = vi.mocked(configureAuthCore).mock.calls[0][0];
    await config.onLogin?.();

    expect(resetSessionState).toHaveBeenCalledTimes(1);
    expect(UsersService.refreshCurrentUser).toHaveBeenCalledTimes(1);
    // Reset must precede the fetch, or the fresh user would be wiped.
    expect(
      vi.mocked(resetSessionState).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(UsersService.refreshCurrentUser).mock.invocationCallOrder[0],
    );
  });
});
