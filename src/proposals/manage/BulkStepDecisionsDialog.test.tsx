import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  proposalBulkStepDecisionsList,
  proposalBulkStepDecisionsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { BulkStepDecisionsButton } from './BulkStepDecisionsButton';
import { BulkStepDecisionsDialog } from './BulkStepDecisionsDialog';

const summary = {
  uuid: 'run-1',
  dry_run: false,
  state: 'done',
  call_uuid: 'call-1',
  call_name: 'Call',
  call_step_uuid: 'admin',
  step_name: 'Administrative check',
  outcome: 'eligible',
  outcome_reason: 'Complete.',
  created_by_uuid: 'u1',
  created_by_name: 'Research Director',
  total: 2,
  processed: 2,
  decided_count: 1,
  refused_count: 1,
  created: '2026-11-27T10:00:00Z',
  modified: '2026-11-27T10:01:00Z',
  started_at: null,
  completed_at: null,
  error_message: '',
};

describe('BulkStepDecisionsDialog', () => {
  it('lists the real runs of the call and reads a run when it is opened', async () => {
    vi.mocked(proposalBulkStepDecisionsList).mockResolvedValue({
      data: [summary],
    } as any);
    vi.mocked(proposalBulkStepDecisionsRetrieve).mockResolvedValue({
      data: {
        ...summary,
        results: [
          {
            proposal_uuid: 'p2',
            proposal_name: 'Climate model',
            status: 'refused',
            detail: 'Checklist unanswered.',
            proposal_state: 'in_review',
            current_step_name: 'Administrative check',
          },
        ],
      },
    } as any);
    renderWithProviders(
      <BulkStepDecisionsDialog resolve={{ callUuid: 'call-1' }} />,
    );

    expect(await screen.findByText('Research Director')).toBeInTheDocument();
    expect(proposalBulkStepDecisionsList).toHaveBeenCalledWith({
      query: { call_uuid: 'call-1', dry_run: false, page_size: 50 },
    });
    expect(proposalBulkStepDecisionsRetrieve).not.toHaveBeenCalled();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByTestId('bulk-refusals')).toHaveTextContent(
      'Climate model',
    );
    expect(proposalBulkStepDecisionsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'run-1' },
    });
  });
});

describe('BulkStepDecisionsButton', () => {
  it('reads the proposals again once a run in the background ends', async () => {
    vi.mocked(proposalBulkStepDecisionsList)
      .mockResolvedValueOnce({
        data: [
          {
            ...summary,
            state: 'running',
            processed: 1,
            modified: new Date().toISOString(),
          },
        ],
      } as any)
      .mockResolvedValue({ data: [summary] } as any);
    const refetch = vi.fn();
    renderWithProviders(
      <BulkStepDecisionsButton callUuid="call-1" refetch={refetch} />,
    );

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1), {
      timeout: 5000,
    });
  });
});
