import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { isFeatureVisible } from '@/features/connect';
import { router } from '@/router';
import { renderHookWithProviders } from '@/test/harness';

import { useProjectPosixGroups } from './useProjectPosixGroups';

vi.mock('@/error/utils', () => ({ goToNotFound: vi.fn() }));
vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn(() => true) }));

// What the SDK's fetch client rejects with: the body's keys plus the
// transport fields that its error interceptor puts next to them.
const serverError = {
  detail: 'Internal error.',
  response: { status: 500 },
  status: 500,
  statusText: 'Internal Server Error',
  url: 'http://localhost/api/marketplace-project-posix-groups/',
};

describe('useProjectPosixGroups error handling', () => {
  afterEach(() => {
    queryClient.clear();
  });

  it('keeps the page in place on a server error, for the tab to show it', async () => {
    vi.mocked(router.stateService.target).mockClear();
    vi.mocked(marketplaceProjectPosixGroupsList).mockRejectedValue(serverError);

    const { result } = renderHookWithProviders(
      () => useProjectPosixGroups('p-500'),
      { queryClient },
    );

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 4000,
    });
    expect(router.stateService.target).not.toHaveBeenCalled();
  });

  it('is needed: the same error without the opt-out redirects', async () => {
    vi.mocked(router.stateService.target).mockClear();
    await queryClient
      .fetchQuery({
        queryKey: ['control-without-opt-out'],
        queryFn: () => Promise.reject(serverError),
        retry: false,
      })
      .catch(() => undefined);

    expect(router.stateService.target).toHaveBeenCalledWith(
      'errorPage.severError',
    );
  });
});

describe('useProjectPosixGroups where POSIX pools are off', () => {
  afterEach(() => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);
  });

  it('does not ask for the groups', async () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    vi.mocked(marketplaceProjectPosixGroupsList).mockClear();
    const { result } = renderHookWithProviders(
      () => useProjectPosixGroups('project-off'),
      { queryClient },
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(marketplaceProjectPosixGroupsList).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
