import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureAuthCore } from 'waldur-auth-core';

import { localLogout } from '@/auth/authNavigation';
import { UsersService } from '@/user/UsersService';

vi.mock('waldur-auth-core', () => ({ configureAuthCore: vi.fn() }));
// `@/router` is globally mocked (test/mocks/router.js); only authNavigation
// needs a local mock so we can assert on localLogout.
vi.mock('@/auth/authNavigation', () => ({ localLogout: vi.fn() }));
vi.mock('@/user/UsersService', () => ({
  UsersService: { getCurrentUser: vi.fn() },
}));

describe('setupAuthCore', () => {
  beforeEach(() => {
    vi.mocked(configureAuthCore).mockClear();
    vi.mocked(localLogout).mockClear();
    vi.mocked(UsersService.getCurrentUser).mockClear();
  });

  it('wires onSessionExpired to log out via authNavigation', async () => {
    const { setupAuthCore } = await import('./authCoreSetup');
    setupAuthCore();

    const config = vi.mocked(configureAuthCore).mock.calls[0][0];
    config.onSessionExpired();

    expect(localLogout).toHaveBeenCalledTimes(1);
  });

  it('wires onLogin to refresh the current user', async () => {
    const { setupAuthCore } = await import('./authCoreSetup');
    setupAuthCore();

    const config = vi.mocked(configureAuthCore).mock.calls[0][0];
    await config.onLogin?.();

    expect(UsersService.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});
