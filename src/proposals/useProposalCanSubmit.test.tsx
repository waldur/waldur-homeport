import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsRetrieve } from 'waldur-js-client';

import {
  invalidateProposalCanSubmit,
  useProposalCanSubmit,
} from './useProposalCanSubmit';

const refused = {
  can_submit: false,
  error: 'Requested amounts are missing for the following offerings: HPC.',
};

const setup = () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(
    ({ proposal }) => useProposalCanSubmit(proposal),
    {
      wrapper,
      initialProps: { proposal: { uuid: 'p1', can_submit: refused } },
    },
  );
  return { queryClient, result, rerender };
};

describe('useProposalCanSubmit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts from the verdict the proposal was loaded with', () => {
    const { result } = setup();
    expect(result.current.data).toEqual(refused);
    expect(proposalProposalsRetrieve).not.toHaveBeenCalled();
  });

  it('picks up a lifted refusal once the resources change', async () => {
    // The applicant fills in the missing amount: the backend now allows it,
    // and Submit must follow without a page reload.
    vi.mocked(proposalProposalsRetrieve).mockResolvedValue({
      data: { can_submit: { can_submit: true, error: null } },
    } as any);
    const { queryClient, result } = setup();

    await act(() => invalidateProposalCanSubmit(queryClient, 'p1'));

    await waitFor(() =>
      expect(result.current.data).toEqual({ can_submit: true, error: null }),
    );
    expect(proposalProposalsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'p1' },
    });
  });

  it('follows the proposal when a background refetch brings a new verdict', async () => {
    // A revisit renders the cached proposal first; the refetched one arrives
    // after the query already exists.
    const { result, rerender } = setup();

    const allowed = { can_submit: true, error: null };
    rerender({ proposal: { uuid: 'p1', can_submit: allowed } });

    await waitFor(() => expect(result.current.data).toEqual(allowed));
    expect(proposalProposalsRetrieve).not.toHaveBeenCalled();
  });
});
