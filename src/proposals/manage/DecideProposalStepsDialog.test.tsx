import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsCompleteWorkflowStep,
  proposalProposalsWorkflowStatesList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { DecideProposalStepsDialog } from './DecideProposalStepsDialog';

const step = (proposal: string, values: Record<string, unknown> = {}) => ({
  uuid: `instance-${proposal}`,
  step: 'administrative_check',
  call_step_uuid: 'admin',
  step_name: 'Administrative check',
  status: 'active',
  kind: 'decision',
  is_allocation_decision: false,
  round_scoped: false,
  allowed_outcomes: ['eligible', 'ineligible'],
  ...values,
});

const proposals = [
  { uuid: 'p1', name: 'Lattice QCD' },
  { uuid: 'p2', name: 'Climate model' },
  { uuid: 'p3', name: 'Protein folding' },
];

describe('DecideProposalStepsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsWorkflowStatesList).mockImplementation(
      ({ path }: any) =>
        Promise.resolve({
          data:
            path.uuid === 'p3'
              ? [
                  step('p3', {
                    call_step_uuid: 'award',
                    kind: 'decision',
                    is_allocation_decision: true,
                  }),
                ]
              : [step(path.uuid)],
        }) as any,
    );
  });

  it('completes the step for the proposals on it and lists the refusals by name', async () => {
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockImplementation(
      ({ path }: any) =>
        path.uuid === 'p2'
          ? Promise.reject({ status: 400, detail: 'Checklist unanswered.' })
          : (Promise.resolve({ data: {} }) as any),
    );
    const refetch = vi.fn();
    renderWithProviders(
      <DecideProposalStepsDialog resolve={{ proposals, refetch }} />,
    );
    const user = userEvent.setup();

    expect(
      await screen.findByText('Not at Administrative check, so left alone: 1'),
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText(/^Eligible/));
    await user.type(screen.getByLabelText(/Reason/), 'Complete.');
    await user.click(screen.getByRole('button', { name: 'Complete (2)' }));

    await waitFor(() =>
      expect(proposalProposalsCompleteWorkflowStep).toHaveBeenCalledWith({
        path: { uuid: 'p1' },
        body: {
          step_uuid: 'instance-p1',
          outcome: 'eligible',
          outcome_reason: 'Complete.',
        },
      }),
    );
    expect(proposalProposalsCompleteWorkflowStep).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Completed: 1')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-failures')).toHaveTextContent(
      'Climate model: Checklist unanswered.',
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('says so when no selected proposal is at a step taken in bulk', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [step('p1', { kind: 'assessment' })],
    } as any);
    renderWithProviders(
      <DecideProposalStepsDialog resolve={{ proposals: [proposals[0]] }} />,
    );
    expect(
      await screen.findByText(/None of the selected proposals/),
    ).toBeInTheDocument();
  });
});
