import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { isFeatureVisible } from '@/features/connect';
import { router } from '@/router';
import { renderHookWithProviders } from '@/test/harness';

import { useProjectPosixGroups } from './useProjectPosixGroups';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn(() => true) }));

// What the SDK's fetch client rejects with: the body's keys plus the
// transport fields that its error interceptor puts next to them.
const apiError = (status: number, statusText: string) => ({
  detail: statusText,
  response: { status },
  status,
  statusText,
  url: 'http://localhost/api/marketplace-project-posix-groups/',
});
const serverError = apiError(500, 'Internal Server Error');
const notFoundError = apiError(404, 'Not Found');

describe('useProjectPosixGroups error handling', () => {
  afterEach(() => {
    queryClient.clear();
  });

  it.each([
    ['a server error', serverError],
    ['a missing list', notFoundError],
  ])(
    'keeps the page in place on %s, for the tab to show it',
    async (_name, error) => {
      vi.mocked(router.stateService.go).mockClear();
      vi.mocked(marketplaceProjectPosixGroupsList).mockRejectedValue(error);

      const { result } = renderHookWithProviders(
        () => useProjectPosixGroups(`p-${error.status}`),
        { queryClient },
      );

      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 4000,
      });
      expect(router.stateService.go).not.toHaveBeenCalled();
    },
  );

  // A 404 is what still redirects without the opt-out; see queryClient.test.ts.
  it('is needed: the same 404 without the opt-out redirects', async () => {
    vi.mocked(router.stateService.go).mockClear();
    await queryClient
      .fetchQuery({
        queryKey: ['control-without-opt-out'],
        queryFn: () => Promise.reject(notFoundError),
        retry: false,
      })
      .catch(() => undefined);

    expect(router.stateService.go).toHaveBeenCalledWith(
      'errorPage.notFound',
      undefined,
      { location: false },
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
