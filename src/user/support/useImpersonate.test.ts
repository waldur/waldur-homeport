import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImpersonationStorage } from '@/core/StorageManager';
import { useNotify } from '@/store/notify';
import { renderHookWithProviders } from '@/test/harness';

import { UsersService } from '../UsersService';

import { useImpersonate } from './useImpersonate';

// Rebuilding the API client needs a configured auth core; storage is what
// these tests check.
vi.mock('@/core/api', () => ({
  getHeaders: vi.fn(),
  initApiClient: vi.fn(),
}));

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useDispatch: () => vi.fn(),
}));

describe('useImpersonate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    ImpersonationStorage.remove();
  });

  const impersonate = async () => {
    const { result } = renderHookWithProviders(() =>
      useImpersonate('target-uuid'),
    );
    let started = false;
    await act(async () => {
      started = await result.current.impersonate();
    });
    return started;
  };

  it('keeps impersonation when the impersonated user loads', async () => {
    vi.spyOn(UsersService, 'refreshCurrentUser').mockResolvedValue({} as any);

    expect(await impersonate()).toBe(true);

    expect(ImpersonationStorage.get()).toBe('target-uuid');
  });

  // The backend refuses impersonation, for example with an OIDC access token.
  // Left in storage, the header would make every later request fail too.
  it('rolls impersonation back when the backend refuses it', async () => {
    const error = { detail: 'Impersonation is not supported.' };
    vi.spyOn(UsersService, 'refreshCurrentUser').mockRejectedValue(error);

    expect(await impersonate()).toBe(false);

    expect(ImpersonationStorage.get()).toBeFalsy();
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      'Unable to impersonate the user.',
    );
  });
});
