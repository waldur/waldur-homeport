import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { router } from '@/router';

const {
  clearImpersonationDataMock,
  isUserValidMock,
  resetSessionStateMock,
  needsPasskeyEnrollmentMock,
  rememberBlockedNavigationMock,
  getUserMock,
} = vi.hoisted(() => ({
  clearImpersonationDataMock: vi.fn(),
  isUserValidMock: vi.fn(() => true),
  resetSessionStateMock: vi.fn(),
  needsPasskeyEnrollmentMock: vi.fn(() => false),
  rememberBlockedNavigationMock: vi.fn(),
  getUserMock: vi.fn(() => undefined),
}));

vi.mock('@/user/UsersService', () => ({
  clearImpersonationData: clearImpersonationDataMock,
  isUserValid: isUserValidMock,
}));

vi.mock('@/workspace/selectors', () => ({
  getUser: getUserMock,
}));

vi.mock('./sessionReset', () => ({
  resetSessionState: resetSessionStateMock,
}));

vi.mock('@/user/passkeys/enforcement', () => ({
  needsPasskeyEnrollment: needsPasskeyEnrollmentMock,
}));

vi.mock('@/user/blockedNavigation', () => ({
  rememberBlockedNavigation: rememberBlockedNavigationMock,
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
  resolvePostLoginTarget,
  clearAuthCache,
  localLogout,
  explicitLogout,
} from './authNavigation';

// clearAuthTokens (called by clearAuthCache) now lives in waldur-auth-core
// and requires configureAuthCore() to have run — wire it to the same
// storage singletons this test asserts against.
setupAuthCore();

const REPLACE = { location: 'replace' };

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
    getUserMock.mockReturnValue(undefined);
    isUserValidMock.mockReturnValue(true);
    needsPasskeyEnrollmentMock.mockReturnValue(false);
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

  describe('resolvePostLoginTarget', () => {
    const intended = { toState: 'project.details', toParams: { uuid: '1' } };
    const user = { uuid: 'u1' } as any;

    it('keeps the intended page when no user is known', () => {
      expect(resolvePostLoginTarget(undefined, intended)).toEqual(intended);
      expect(rememberBlockedNavigationMock).not.toHaveBeenCalled();
    });

    it('keeps the intended page for a valid user', () => {
      expect(resolvePostLoginTarget(user, intended)).toEqual(intended);
      expect(rememberBlockedNavigationMock).not.toHaveBeenCalled();
    });

    it('sends an incomplete profile to profile-manage and remembers the page', () => {
      isUserValidMock.mockReturnValue(false);
      expect(resolvePostLoginTarget(user, intended)).toEqual({
        toState: 'profile-manage',
        toParams: {},
      });
      expect(rememberBlockedNavigationMock).toHaveBeenCalledWith(
        'project.details',
        { uuid: '1' },
      );
    });

    it('sends a user owing a passkey to the enrollment page first', () => {
      needsPasskeyEnrollmentMock.mockReturnValue(true);
      isUserValidMock.mockReturnValue(false);
      expect(resolvePostLoginTarget(user, intended)).toEqual({
        toState: 'profile-passkeys-required',
        toParams: {},
      });
      expect(isUserValidMock).not.toHaveBeenCalled();
    });
  });

  describe('redirectOnSuccess', () => {
    it('navigates to the stored redirect target, replacing the URL, and clears it', async () => {
      RedirectStorage.set({
        toState: 'project.details',
        toParams: { uuid: '1' },
      });
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenCalledTimes(1);
      expect(router.stateService.go).toHaveBeenCalledWith(
        'project.details',
        { uuid: '1' },
        REPLACE,
      );
      expect(RedirectStorage.get()).toBeNull();
    });

    it('falls back to the default state when nothing was stored', async () => {
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenCalledWith(
        'profile.details',
        {},
        REPLACE,
      );
    });

    it('ignores a stored error state', async () => {
      RedirectStorage.set({ toState: 'errorPage.notFound', toParams: {} });
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenCalledWith(
        'profile.details',
        {},
        REPLACE,
      );
      expect(RedirectStorage.get()).toBeNull();
    });

    it('resolves the gate page against the signed-in user before navigating', async () => {
      getUserMock.mockReturnValue({ uuid: 'u1' } as any);
      isUserValidMock.mockReturnValue(false);
      RedirectStorage.set({
        toState: 'project.details',
        toParams: { uuid: '1' },
      });
      await redirectOnSuccess();
      expect(router.stateService.go).toHaveBeenCalledTimes(1);
      expect(router.stateService.go).toHaveBeenCalledWith(
        'profile-manage',
        {},
        REPLACE,
      );
      expect(rememberBlockedNavigationMock).toHaveBeenCalledWith(
        'project.details',
        { uuid: '1' },
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
        {},
        REPLACE,
      );
    });
  });

  describe('clearAuthCache', () => {
    it('resets session state (keeping observed queries), impersonation data, and stored tokens', () => {
      AuthTokenStorage.set('some-token');
      AuthMethodStorage.set('local');

      clearAuthCache();

      // The authenticated layout may still be mounted on the session-expired
      // path; purging its queries would refetch them without a token.
      expect(resetSessionStateMock).toHaveBeenCalledWith({ queries: false });
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
