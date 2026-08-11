import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

const { clearImpersonationDataMock, setCurrentUserMock } = vi.hoisted(() => ({
  clearImpersonationDataMock: vi.fn(),
  setCurrentUserMock: vi.fn((payload) => ({
    type: 'SET_CURRENT_USER',
    payload,
  })),
}));

vi.mock('@/user/UsersService', () => ({
  clearImpersonationData: clearImpersonationDataMock,
}));

vi.mock('@/workspace/actions', () => ({
  setCurrentUser: setCurrentUserMock,
}));

// `@/router` is globally mocked (test/mocks/router.js).
import { setupAuthCore } from '../core/authCoreSetup';
import {
  AuthMethodStorage,
  AuthTokenStorage,
  RedirectStorage,
} from '../core/StorageManager';

import {
  storeRedirect,
  redirectOnSuccess,
  clearAuthCache,
  localLogout,
  explicitLogout,
} from './authNavigation';

// clearAuthTokens (called by clearAuthCache) now lives in waldur-auth-core
// and requires configureAuthCore() to have run — wire it to the same
// storage singletons this test asserts against.
setupAuthCore();

// Node 25 ships an experimental top-level `localStorage` that conflicts with
// the one provided by jsdom; stub a plain in-memory shim so storage-backed
// managers behave deterministically (mirrors src/core/api.test.ts).
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

describe('authNavigation', () => {
  beforeEach(() => {
    installMemoryStorage();
    localStorage.clear();
    router.globals.params = {} as never;
    router.stateService.go = vi.fn();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('storeRedirect', () => {
    it('stores the pending toState/toParams from router.globals', () => {
      router.globals.params = {
        toState: 'project.details',
        toParams: { uuid: '1' },
      } as never;
      storeRedirect();
      expect(RedirectStorage.get()).toEqual({
        toState: 'project.details',
        toParams: { uuid: '1' },
      });
    });

    it('does not store when toState is the default redirect state', () => {
      router.globals.params = {
        toState: 'profile.details',
        toParams: {},
      } as never;
      storeRedirect();
      expect(RedirectStorage.get()).toBeNull();
    });

    it('does not store when toState is an error state', () => {
      router.globals.params = {
        toState: 'errorPage.notFound',
        toParams: {},
      } as never;
      storeRedirect();
      expect(RedirectStorage.get()).toBeNull();
    });

    it('does not store when there is no pending toState', () => {
      router.globals.params = {} as never;
      storeRedirect();
      expect(RedirectStorage.get()).toBeNull();
    });
  });

  describe('redirectOnSuccess', () => {
    it('navigates to the stored redirect target and clears it', async () => {
      RedirectStorage.set({
        toState: 'project.details',
        toParams: { uuid: '1' },
      });
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenCalledWith('project.details', {
        uuid: '1',
      });
      expect(RedirectStorage.get()).toBeNull();
      // document.location.reload() also runs here; jsdom's Location object
      // isn't mockable (non-configurable `location` property), so the final
      // reload is exercised but not asserted on at the unit level.
    });

    it('falls back to the default state when nothing was stored', async () => {
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenCalledWith(
        'profile.details',
        {},
      );
    });

    it('falls back to the default state when navigation to the stored target fails', async () => {
      RedirectStorage.set({
        toState: 'project.details',
        toParams: { uuid: '1' },
      });
      router.stateService.go = vi
        .fn()
        .mockRejectedValueOnce(new Error('unknown state'))
        .mockResolvedValueOnce(undefined);
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenNthCalledWith(
        2,
        'profile.details',
      );
    });
  });

  describe('clearAuthCache', () => {
    it('clears the current user, impersonation data, and stored tokens', () => {
      AuthTokenStorage.set('some-token');
      AuthMethodStorage.set('local');

      clearAuthCache();

      expect(setCurrentUserMock).toHaveBeenCalledWith(undefined);
      expect(clearImpersonationDataMock).toHaveBeenCalled();
      expect(AuthTokenStorage.get()).toBeNull();
      expect(AuthMethodStorage.get()).toBeNull();
    });
  });

  describe('localLogout', () => {
    it('clears the auth cache and navigates to the login state', () => {
      AuthTokenStorage.set('some-token');
      localLogout();
      expect(AuthTokenStorage.get()).toBeNull();
      expect(router.stateService.go).toHaveBeenCalledWith('login');
    });
  });

  describe('explicitLogout', () => {
    it('clears any pending redirect before logging out', () => {
      RedirectStorage.set({
        toState: 'project.details',
        toParams: { uuid: '1' },
      });
      explicitLogout();
      expect(RedirectStorage.get()).toBeNull();
      expect(router.stateService.go).toHaveBeenCalledWith('login');
    });
  });
});
