import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingMergesRetrieve } from 'waldur-js-client';

import { createTestWrapper } from '@/test/harness';

import { useOfferingMerge } from './hooks';

vi.mock('./constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./constants')>()),
  POLL_INTERVAL: 10,
}));

const respond = (state: string) => ({ data: { uuid: 'merge', state } }) as any;

describe('useOfferingMerge', () => {
  it('polls a running merge and stops once it is done', async () => {
    vi.mocked(marketplaceOfferingMergesRetrieve)
      .mockResolvedValueOnce(respond('queued'))
      .mockResolvedValueOnce(respond('running'))
      .mockResolvedValue(respond('done'));

    const { wrapper } = createTestWrapper();
    const { result } = renderHook(() => useOfferingMerge('merge'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data?.state).toBe('done'));
    const calls = vi.mocked(marketplaceOfferingMergesRetrieve).mock.calls
      .length;
    expect(calls).toBe(3);

    // Several poll intervals later nothing more was fetched.
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(vi.mocked(marketplaceOfferingMergesRetrieve)).toHaveBeenCalledTimes(
      calls,
    );
  });

  it('does not fetch without a merge', () => {
    vi.mocked(marketplaceOfferingMergesRetrieve).mockClear();
    const { wrapper } = createTestWrapper();
    renderHook(() => useOfferingMerge(undefined), { wrapper });
    expect(marketplaceOfferingMergesRetrieve).not.toHaveBeenCalled();
  });
});
