import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  coiDetectionJobsList,
  coiDetectionJobsRetrieve,
  proposalProtectedCallsDetectConflicts,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { DetectConflictsButton } from './DetectConflictsButton';

const call = { uuid: 'call-1', name: 'Call' } as any;

const job = (overrides = {}) => ({
  uuid: 'job-1',
  state: 'pending',
  total_pairs: 0,
  processed_pairs: 0,
  conflicts_found: 0,
  error_message: '',
  ...overrides,
});

const renderButton = (refetch = vi.fn()) => {
  renderWithProviders(<DetectConflictsButton call={call} refetch={refetch} />);
  return refetch;
};

const button = () => screen.getByRole('button', { name: /Detect conflicts/ });

describe('DetectConflictsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(coiDetectionJobsList).mockResolvedValue({ data: [] } as any);
    vi.mocked(proposalProtectedCallsDetectConflicts).mockResolvedValue({
      data: job(),
    } as any);
  });

  it('starts a full-call detection and reloads the list when it finishes', async () => {
    vi.mocked(coiDetectionJobsRetrieve).mockResolvedValue({
      data: job({ state: 'completed', conflicts_found: 4 }),
    } as any);
    const refetch = renderButton();

    await userEvent.click(button());

    expect(proposalProtectedCallsDetectConflicts).toHaveBeenCalledWith({
      path: { uuid: 'call-1' },
      body: { job_type: 'full_call' },
    });
    const { showSuccess } = useNotify();
    await waitFor(() =>
      expect(showSuccess).toHaveBeenCalledWith(
        'Conflict detection finished: 4 new conflicts found.',
      ),
    );
    expect(coiDetectionJobsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'job-1' },
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('reports the reason a detection run failed', async () => {
    vi.mocked(coiDetectionJobsRetrieve).mockResolvedValue({
      data: job({ state: 'failed', error_message: 'Boom' }),
    } as any);
    const refetch = renderButton();

    await userEvent.click(button());

    const { showError } = useNotify();
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Boom'));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the backend reason when detection cannot start', async () => {
    const error = new Error('turned off');
    vi.mocked(proposalProtectedCallsDetectConflicts).mockRejectedValue(error);
    renderButton();

    await userEvent.click(button());

    const { showErrorResponse } = useNotify();
    await waitFor(() =>
      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to start conflict detection.',
      ),
    );
    expect(coiDetectionJobsRetrieve).not.toHaveBeenCalled();
  });

  it('does not offer a second run while one is going', async () => {
    vi.mocked(coiDetectionJobsList).mockResolvedValue({
      data: [job({ state: 'running', total_pairs: 20, processed_pairs: 5 })],
    } as any);
    vi.mocked(coiDetectionJobsRetrieve).mockResolvedValue({
      data: job({ state: 'running', total_pairs: 20, processed_pairs: 5 }),
    } as any);
    renderButton();

    await waitFor(() => expect(button()).toBeDisabled());
    expect(coiDetectionJobsList).toHaveBeenCalledWith({
      query: {
        call_uuid: 'call-1',
        state: ['pending', 'running'],
        page_size: 1,
      },
    });
  });
});
