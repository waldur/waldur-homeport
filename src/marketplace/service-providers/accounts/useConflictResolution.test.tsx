import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceServiceProvidersPartialUpdate,
  marketplaceServiceProvidersUsernameConflictsList,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';

import {
  useGuardedProviderUpdate,
  UsernameConflictsPending,
} from './useConflictResolution';

const openDialog = vi.fn();
const setServiceProvider = vi.fn();

const perOffering = {
  uuid: 'provider-uuid',
  account_options: { account_scope: 'offering' },
} as any;

const switchToProvider = { account_options: { account_scope: 'provider' } };

const conflict = {
  user_uuid: 'user-1',
  user_username: 'jdoe',
  candidates: [
    {
      username: 'jdoe',
      offering_count: 1,
      has_active_resources: true,
      home_directories: [],
    },
    {
      username: 'j.doe',
      offering_count: 1,
      has_active_resources: false,
      home_directories: [],
    },
  ],
};

const renderUpdate = (provider = perOffering) =>
  renderHook(() => useGuardedProviderUpdate(provider, setServiceProvider))
    .result.current;

describe('useGuardedProviderUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({ openDialog } as any);
    vi.mocked(marketplaceServiceProvidersPartialUpdate).mockResolvedValue({
      data: { ...perOffering, ...switchToProvider },
    } as any);
  });

  it('switches in one step when no usernames conflict', async () => {
    vi.mocked(
      marketplaceServiceProvidersUsernameConflictsList,
    ).mockResolvedValue({ data: [] } as any);

    await renderUpdate()(switchToProvider);

    expect(marketplaceServiceProvidersPartialUpdate).toHaveBeenCalledWith({
      path: { uuid: 'provider-uuid' },
      body: switchToProvider,
    });
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('shows the conflicts instead of saving, and switches once they are resolved', async () => {
    vi.mocked(
      marketplaceServiceProvidersUsernameConflictsList,
    ).mockResolvedValue({ data: [conflict] } as any);

    await expect(renderUpdate()(switchToProvider)).rejects.toBeInstanceOf(
      UsernameConflictsPending,
    );
    expect(marketplaceServiceProvidersPartialUpdate).not.toHaveBeenCalled();
    expect(openDialog).toHaveBeenCalledTimes(1);
    const { resolve } = openDialog.mock.calls[0][1];
    expect(resolve.conflicts).toEqual([conflict]);
    expect(resolve.pendingSwitch).toBe(true);

    // The resolution dialog calls back once every conflict is resolved.
    await resolve.refetch();
    expect(marketplaceServiceProvidersPartialUpdate).toHaveBeenCalledWith({
      path: { uuid: 'provider-uuid' },
      body: switchToProvider,
    });
  });

  it('leaves other edits alone', async () => {
    await renderUpdate()({ account_options: { login_shell: '/bin/zsh' } });

    expect(
      marketplaceServiceProvidersUsernameConflictsList,
    ).not.toHaveBeenCalled();
    expect(marketplaceServiceProvidersPartialUpdate).toHaveBeenCalled();
  });

  it('does not look again once the provider is already per service provider', async () => {
    await renderUpdate({
      ...perOffering,
      account_options: { account_scope: 'provider' },
    })(switchToProvider);

    expect(
      marketplaceServiceProvidersUsernameConflictsList,
    ).not.toHaveBeenCalled();
  });
});
