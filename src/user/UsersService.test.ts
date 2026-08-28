import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersMeRetrieve } from 'waldur-js-client';

const { getRolesMock, dispatchMock, getStateMock } = vi.hoisted(() => ({
  getRolesMock: vi.fn(),
  dispatchMock: vi.fn(),
  getStateMock: vi.fn(() => ({ workspace: {} })),
}));

// `waldur-js-client` is auto-mocked globally (test/mocks/modal.js). The SDK
// response type carries the raw Request/Response; the service only reads
// `data`, so the mock is typed down to that.
const usersMeRetrieveMock = vi.mocked(
  usersMeRetrieve as unknown as (
    options?: unknown,
  ) => Promise<{ data: unknown }>,
);

vi.mock('@/administration/roles/utils', () => ({
  getRoles: getRolesMock,
}));

vi.mock('@/core/api', () => ({
  getHeaders: vi.fn(),
  initApiClient: vi.fn(),
}));

vi.mock('@/store/store', () => ({
  default: { dispatch: dispatchMock, getState: getStateMock },
}));

vi.mock('@/core/StorageManager', () => ({
  ImpersonationStorage: { set: vi.fn(), get: vi.fn(), remove: vi.fn() },
}));

vi.mock('@/user/useProfileCompleteness', () => ({
  getProfileCompleteness: (user) => ({
    is_complete: Boolean(user.profile_complete),
  }),
}));

import { ENV } from '@/core/config';

import {
  isUserValid,
  resetUserCache,
  setImpersonationData,
  UsersService,
} from './UsersService';

const alice = { uuid: 'u1', username: 'alice' };
const roles = [{ uuid: 'r1', name: 'owner' }];

/** A promise the test resolves by hand, to hold a request "in flight". */
const deferred = <T>() => {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve: resolve! };
};

describe('UsersService.refreshCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUserCache();
    ENV.roles = [];
    usersMeRetrieveMock.mockResolvedValue({ data: alice });
    getRolesMock.mockResolvedValue(roles);
  });

  it('fetches the user and the roles once, in parallel', async () => {
    const user = await UsersService.refreshCurrentUser();

    expect(user).toEqual(alice);
    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(1);
    expect(getRolesMock).toHaveBeenCalledTimes(1);
    expect(ENV.roles).toEqual(roles);
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { user: alice } }),
    );
  });

  it('shares one request between concurrent callers', async () => {
    const me = deferred<{ data: typeof alice }>();
    usersMeRetrieveMock.mockReturnValue(me.promise);

    const first = UsersService.refreshCurrentUser();
    const second = UsersService.refreshCurrentUser();
    const third = UsersService.getCurrentUser();
    me.resolve({ data: alice });

    await expect(Promise.all([first, second, third])).resolves.toEqual([
      alice,
      alice,
      alice,
    ]);
    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(1);
    expect(getRolesMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it('does not reuse the roles crawl once roles are loaded', async () => {
    await UsersService.refreshCurrentUser();
    await UsersService.refreshCurrentUser();

    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(2);
    expect(getRolesMock).toHaveBeenCalledTimes(1);
  });

  it('starts fresh after the cache is reset', async () => {
    const me = deferred<{ data: typeof alice }>();
    usersMeRetrieveMock.mockReturnValue(me.promise);

    const stale = UsersService.refreshCurrentUser();
    resetUserCache();
    ENV.roles = [];
    usersMeRetrieveMock.mockResolvedValue({ data: { ...alice, uuid: 'u2' } });
    const fresh = UsersService.refreshCurrentUser();
    me.resolve({ data: alice });

    await expect(fresh).resolves.toEqual({ ...alice, uuid: 'u2' });
    await stale;
    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(2);
    // The pre-reset answer arrived last but must not overwrite the new user.
    const dispatched = dispatchMock.mock.calls.map(([a]) => a.payload.user);
    expect(dispatched).toEqual([{ ...alice, uuid: 'u2' }]);
  });

  it('does not share a request across an impersonation change', async () => {
    const me = deferred<{ data: typeof alice }>();
    usersMeRetrieveMock.mockReturnValue(me.promise);

    const before = UsersService.refreshCurrentUser();
    setImpersonationData('someone-else');
    usersMeRetrieveMock.mockResolvedValue({ data: { ...alice, uuid: 'imp' } });
    const after = UsersService.refreshCurrentUser();
    me.resolve({ data: alice });

    await Promise.all([before, after]);
    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(2);
    const dispatched = dispatchMock.mock.calls.map(([a]) => a.payload.user);
    expect(dispatched).toEqual([{ ...alice, uuid: 'imp' }]);
  });

  it('lets the next caller retry after a failure', async () => {
    usersMeRetrieveMock.mockRejectedValueOnce(new Error('boom'));

    await expect(UsersService.refreshCurrentUser()).rejects.toThrow('boom');
    await expect(UsersService.refreshCurrentUser()).resolves.toEqual(alice);
    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(2);
  });

  it('does not share requests that carry custom headers', async () => {
    const plain = UsersService.refreshCurrentUser();
    const impersonated = UsersService.refreshCurrentUser({
      headers: { 'X-Impersonated-User-UUID': 'x' },
    } as any);

    await Promise.all([plain, impersonated]);
    expect(usersMeRetrieveMock).toHaveBeenCalledTimes(2);
  });
});

describe('isUserValid', () => {
  it('always accepts staff and support', () => {
    expect(isUserValid({ is_staff: true } as any)).toBe(true);
    expect(isUserValid({ is_support: true } as any)).toBe(true);
  });

  it('requires a complete profile and accepted terms for everyone else', () => {
    expect(
      isUserValid({
        profile_complete: true,
        agreement_date: '2026-01-01',
      } as any),
    ).toBe(true);
    expect(isUserValid({ profile_complete: true } as any)).toBe(false);
    expect(
      isUserValid({
        profile_complete: false,
        agreement_date: '2026-01-01',
      } as any),
    ).toBe(false);
  });
});
