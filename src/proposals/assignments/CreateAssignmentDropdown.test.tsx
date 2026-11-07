import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsComputeAffinities,
  proposalProtectedCallsGenerateAssignments,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { CreateAssignmentDropdown } from './CreateAssignmentDropdown';

const call = { uuid: 'call-1', name: 'Call' } as any;

const openMenu = async () => {
  renderWithProviders(
    <CreateAssignmentDropdown call={call} refetch={vi.fn()} />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Create assignment' }),
  );
};

describe('CreateAssignmentDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete ENV.plugins.WALDUR_CORE.AUTOMATED_MATCHING_ENABLED;
  });

  it('computes affinities for the call', async () => {
    vi.mocked(proposalProtectedCallsComputeAffinities).mockResolvedValue({
      data: { computed_count: 12, message: 'Computed 12 affinity scores.' },
    } as any);
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Compute affinities' }),
    );

    expect(proposalProtectedCallsComputeAffinities).toHaveBeenCalledWith({
      path: { uuid: 'call-1' },
    });
    const { showSuccess } = useNotify();
    await waitFor(() =>
      expect(showSuccess).toHaveBeenCalledWith('Computed 12 affinity scores.'),
    );
  });

  it('explains why nothing was computed', async () => {
    vi.mocked(proposalProtectedCallsComputeAffinities).mockResolvedValue({
      data: { computed_count: 0, message: 'Computed 0 affinity scores.' },
    } as any);
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Compute affinities' }),
    );

    const { showRedirectMessage } = useNotify();
    await waitFor(() =>
      expect(showRedirectMessage).toHaveBeenCalledWith(
        'No affinity scores computed',
        'The call needs proposals and accepted pool members with a reviewer profile.',
      ),
    );
  });

  it('shows the backend reason when computing fails', async () => {
    const error = new Error('turned off');
    vi.mocked(proposalProtectedCallsComputeAffinities).mockRejectedValue(error);
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Compute affinities' }),
    );

    const { showErrorResponse } = useNotify();
    await waitFor(() =>
      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to compute affinities.',
      ),
    );
  });

  it('says which proposals got no reviewer, and why', async () => {
    vi.mocked(proposalProtectedCallsGenerateAssignments).mockResolvedValue({
      data: {
        batches_created: 0,
        items_created: 0,
        proposals_processed: 0,
        skipped_proposals: [
          {
            proposal_name: 'Cryo-EM',
            reason: 'No eligible reviewer reaches the minimum affinity',
          },
          {
            proposal_name: 'Fusion',
            reason: 'Already has enough reviewers',
          },
          {
            proposal_name: 'Photonics',
            reason: 'No eligible reviewer reaches the minimum affinity',
          },
        ],
      },
    } as any);
    await openMenu();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Generate assignments' }),
    );

    const { showRedirectMessage, showSuccess } = useNotify();
    await waitFor(() =>
      expect(showRedirectMessage).toHaveBeenCalledWith(
        'No reviewer added to 3 proposals',
        'No eligible reviewer reaches the minimum affinity: Cryo-EM, Photonics. Already has enough reviewers: Fusion.',
      ),
    );
    // Nothing generated: no success to report beside it.
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it('offers no automated matching when the platform turns it off', async () => {
    ENV.plugins.WALDUR_CORE.AUTOMATED_MATCHING_ENABLED = false;
    await openMenu();

    expect(
      await screen.findByRole('menuitem', { name: 'Manual assignment' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Compute affinities' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'Generate assignments' }),
    ).not.toBeInTheDocument();
  });
});
