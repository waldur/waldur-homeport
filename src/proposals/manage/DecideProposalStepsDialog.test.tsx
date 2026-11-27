import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalBulkStepDecisionsList,
  proposalBulkStepDecisionsRetrieve,
  proposalProposalsCompleteWorkflowStep,
  proposalProtectedCallsDecidableWorkflowSteps,
  proposalProtectedCallsDecideWorkflowSteps,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { DecideProposalStepsDialog } from './DecideProposalStepsDialog';

const proposals = [
  { uuid: 'p1', name: 'Lattice QCD' },
  { uuid: 'p2', name: 'Climate model' },
  { uuid: 'p3', name: 'Protein folding' },
];

const run = (values: Record<string, unknown> = {}) => ({
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
  created_by_name: 'Manager',
  total: 2,
  processed: 2,
  decided_count: 1,
  refused_count: 1,
  results: [
    {
      proposal_uuid: 'p1',
      proposal_name: 'Lattice QCD',
      status: 'decided',
      detail: 'Decided.',
      proposal_state: 'in_review',
      current_step_name: 'Allocation decision',
    },
    {
      proposal_uuid: 'p2',
      proposal_name: 'Climate model',
      status: 'refused',
      detail: 'Checklist unanswered.',
      proposal_state: 'in_review',
      current_step_name: 'Administrative check',
    },
  ],
  created: '2026-11-27T10:00:00Z',
  modified: new Date().toISOString(),
  started_at: null,
  completed_at: null,
  error_message: '',
  ...values,
});

const render = (refetch = vi.fn()) =>
  renderWithProviders(
    <DecideProposalStepsDialog
      resolve={{ callUuid: 'call-1', proposals, refetch }}
    />,
  );

const fillAndPreview = async () => {
  const user = userEvent.setup();
  expect(
    await screen.findByText('Not at Administrative check, so left alone: 1'),
  ).toBeInTheDocument();
  await user.click(screen.getByLabelText(/^Eligible/));
  await user.type(screen.getByLabelText(/Reason/), 'Complete.');
  await user.click(screen.getByRole('button', { name: 'Preview (2)' }));
  return user;
};

describe('DecideProposalStepsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsDecidableWorkflowSteps).mockResolvedValue({
      data: [
        {
          call_step_uuid: 'admin',
          step_name: 'Administrative check',
          allowed_outcomes: ['eligible', 'ineligible'],
          proposal_uuids: ['p1', 'p2'],
        },
      ],
    } as any);
  });

  it('previews the run, then decides on the server and lists the refusals by name', async () => {
    vi.mocked(proposalProtectedCallsDecideWorkflowSteps).mockImplementation(
      ({ body }: any) =>
        Promise.resolve({
          data: body.dry_run
            ? run({
                uuid: null,
                dry_run: true,
                results: run().results.map((r) =>
                  r.status === 'decided'
                    ? { ...r, detail: 'Can be decided.' }
                    : r,
                ),
              })
            : run(),
        }) as any,
    );
    const refetch = vi.fn();
    render(refetch);
    const user = await fillAndPreview();

    expect(await screen.findByText('Will be decided: 1')).toBeInTheDocument();
    expect(screen.getByText('Will be refused: 1')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-refusals')).toHaveTextContent(
      'Climate model',
    );
    expect(proposalProtectedCallsDecideWorkflowSteps).toHaveBeenCalledWith({
      path: { uuid: 'call-1' },
      body: {
        call_step_uuid: 'admin',
        outcome: 'eligible',
        outcome_reason: 'Complete.',
        proposal_uuids: ['p1', 'p2'],
        dry_run: true,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Decide (1)' }));

    expect(await screen.findByText('Decided: 1')).toBeInTheDocument();
    expect(screen.getByText('Refused: 1')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-refusals')).toHaveTextContent(
      'Checklist unanswered.',
    );
    expect(proposalProtectedCallsDecideWorkflowSteps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ dry_run: false }),
      }),
    );
    // Nothing is decided proposal by proposal from the browser.
    expect(proposalProposalsCompleteWorkflowStep).not.toHaveBeenCalled();
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('follows a run in the background until it is done', async () => {
    vi.mocked(proposalProtectedCallsDecideWorkflowSteps).mockImplementation(
      ({ body }: any) =>
        Promise.resolve({
          data: body.dry_run
            ? run({ uuid: null, dry_run: true })
            : run({
                state: 'pending',
                processed: 0,
                decided_count: 0,
                refused_count: 0,
                results: [],
              }),
        }) as any,
    );
    // While it goes on, only its summary is read; its results once done.
    const { results: _results, ...summaryOf } = run();
    vi.mocked(proposalBulkStepDecisionsList)
      .mockResolvedValueOnce({
        data: [
          { ...summaryOf, state: 'running', processed: 1, refused_count: 0 },
        ],
      } as any)
      .mockResolvedValue({ data: [summaryOf] } as any);
    vi.mocked(proposalBulkStepDecisionsRetrieve).mockResolvedValue({
      data: run(),
    } as any);
    render();
    const user = await fillAndPreview();
    await user.click(await screen.findByRole('button', { name: 'Decide (1)' }));

    expect(await screen.findByTestId('bulk-progress')).toHaveTextContent(
      /Deciding in the background: \d of 2/,
    );
    expect(
      await screen.findByText('Decided: 1', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(proposalBulkStepDecisionsList).toHaveBeenCalledWith({
      query: { uuid: 'run-1' },
    });
    // Its results are read once, when it has stopped.
    expect(await screen.findByTestId('bulk-refusals')).toHaveTextContent(
      'Climate model',
    );
    expect(proposalBulkStepDecisionsRetrieve).toHaveBeenCalledTimes(1);
  });

  it('follows a large preview in the background before offering to decide', async () => {
    vi.mocked(proposalProtectedCallsDecideWorkflowSteps).mockResolvedValue({
      data: run({
        uuid: 'preview-1',
        dry_run: true,
        state: 'pending',
        processed: 0,
        decided_count: 0,
        refused_count: 0,
        results: [],
      }),
    } as any);
    const { results: _r, ...previewSummary } = run({
      uuid: 'preview-1',
      dry_run: true,
    });
    vi.mocked(proposalBulkStepDecisionsList).mockResolvedValue({
      data: [previewSummary],
    } as any);
    vi.mocked(proposalBulkStepDecisionsRetrieve).mockResolvedValue({
      data: run({ uuid: 'preview-1', dry_run: true }),
    } as any);
    render();
    await fillAndPreview();

    expect(
      await screen.findByRole('button', { name: 'Decide (1)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Will be decided: 1')).toBeInTheDocument();
    expect(proposalBulkStepDecisionsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'preview-1' },
    });
  });

  it('says so when the steps of the selection cannot be read', async () => {
    vi.mocked(proposalProtectedCallsDecidableWorkflowSteps).mockRejectedValue({
      status: 500,
    });
    render();
    expect(
      await screen.findByText(
        'Unable to read which steps the selected proposals stand on.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });

  it('refuses a selection larger than a run takes', async () => {
    renderWithProviders(
      <DecideProposalStepsDialog
        resolve={{
          callUuid: 'call-1',
          proposals: Array.from({ length: 2001 }, (_, i) => ({
            uuid: `p${i}`,
            name: `P${i}`,
          })),
        }}
      />,
    );
    expect(
      await screen.findByText(/at most 2000 proposals/),
    ).toBeInTheDocument();
    expect(proposalProtectedCallsDecidableWorkflowSteps).not.toHaveBeenCalled();
  });

  it('says so when no selected proposal is at a step taken in bulk', async () => {
    vi.mocked(proposalProtectedCallsDecidableWorkflowSteps).mockResolvedValue({
      data: [],
    } as any);
    render();
    expect(
      await screen.findByText(/None of the selected proposals/),
    ).toBeInTheDocument();
  });
});
