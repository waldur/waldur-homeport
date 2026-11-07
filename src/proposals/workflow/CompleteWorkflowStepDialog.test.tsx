import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { proposalProposalsCompleteWorkflowStep } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CompleteWorkflowStepDialog } from './CompleteWorkflowStepDialog';

const REFUSAL =
  'Cannot complete Allocation decision: awarded amounts are missing for the following offerings: HPC Standard Allocation.';

describe('CompleteWorkflowStepDialog', () => {
  // Completing the allocation decision with an award item that grants no
  // amount is refused with a reason naming the offerings. The manager has to
  // read it to fix the award, so it stays in the dialog.
  it('shows why the backend refused the completion', async () => {
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockImplementation(
      () =>
        Promise.reject({
          detail: [REFUSAL],
          response: { status: 400 },
        }) as any,
    );

    renderWithProviders(
      <CompleteWorkflowStepDialog
        resolve={{
          proposal: { uuid: 'proposal-1' } as any,
          step: {
            uuid: 'step-1',
            step: 'allocation_decision',
            kind: 'decision',
            outcome_set: 'approval',
            is_allocation_decision: true,
            allowed_outcomes: ['approved', 'declined'],
            step_name: 'Allocation decision',
          } as any,
        }}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Approved'));
    await user.click(screen.getByRole('button', { name: /Complete step/ }));

    expect(await screen.findByText(REFUSAL)).toBeInTheDocument();
    expect(
      screen.getByText('The step cannot be completed yet'),
    ).toBeInTheDocument();
  });

  it('says the step waits for the lead of its role', () => {
    const message =
      "Only the lead of the role 'Rapporteur' contributes to this step; mark one holder as the lead.";
    renderWithProviders(
      <CompleteWorkflowStepDialog
        resolve={{
          proposal: { uuid: 'proposal-1' } as any,
          step: {
            uuid: 'step-2',
            kind: 'assessment',
            outcome_set: 'done',
            allowed_outcomes: ['done'],
            step_name: 'Consolidated report',
            contributors_lead_only: true,
            awaiting_lead: message,
          } as any,
        }}
      />,
    );

    expect(
      screen.getByText('The step is waiting for a lead'),
    ).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('says why a step cannot move on', () => {
    const message =
      'Nobody is on the team of Cloud VM Package to assess it: a call manager can submit the assessment in its place.';
    renderWithProviders(
      <CompleteWorkflowStepDialog
        resolve={{
          proposal: { uuid: 'proposal-1' } as any,
          step: {
            uuid: 'step-3',
            kind: 'assessment',
            outcome_set: 'feasibility',
            allowed_outcomes: ['feasible', 'infeasible'],
            step_name: 'Technical assessment',
            waiting_for: message,
          } as any,
        }}
      />,
    );

    expect(screen.getByText('The step cannot move on yet')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('asks to confirm completing a step without the work it waits for', async () => {
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockReset();
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <CompleteWorkflowStepDialog
        resolve={{
          proposal: { uuid: 'proposal-1' } as any,
          step: {
            uuid: 'step-5',
            kind: 'assessment',
            outcome_set: 'done',
            allowed_outcomes: ['done'],
            step_name: 'Consensus report',
            waiting_for:
              "Nobody holds the role 'Consensus expert' on this proposal to contribute: assign a holder.",
          } as any,
        }}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Done'));
    await user.click(screen.getByRole('button', { name: /Complete step/ }));
    expect(proposalProposalsCompleteWorkflowStep).not.toHaveBeenCalled();

    await user.click(screen.getByText('Complete it without that work'));
    await user.click(screen.getByRole('button', { name: /Complete step/ }));
    await vi.waitFor(() =>
      expect(proposalProposalsCompleteWorkflowStep).toHaveBeenCalled(),
    );
  });

  it('asks to confirm completing an assignment that leaves the reviews short', async () => {
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockReset();
    vi.mocked(proposalProposalsCompleteWorkflowStep).mockResolvedValue({
      data: {},
    } as any);
    const warning =
      'Scientific review needs 3 reviews; 0 reviewers are assigned.';
    renderWithProviders(
      <CompleteWorkflowStepDialog
        resolve={{
          proposal: { uuid: 'proposal-1' } as any,
          step: {
            uuid: 'step-4',
            kind: 'assignment',
            outcome_set: 'done',
            allowed_outcomes: ['done'],
            step_name: 'Scientific reviewer assignment',
            completion_warning: warning,
          } as any,
        }}
      />,
    );
    expect(screen.getByTestId('completion-warning')).toHaveTextContent(warning);

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Done'));
    await user.click(screen.getByRole('button', { name: /Complete step/ }));
    expect(proposalProposalsCompleteWorkflowStep).not.toHaveBeenCalled();

    await user.click(screen.getByText('Complete the step anyway'));
    await user.click(screen.getByRole('button', { name: /Complete step/ }));
    await vi.waitFor(() =>
      expect(proposalProposalsCompleteWorkflowStep).toHaveBeenCalled(),
    );
  });

  it('shows the score against the threshold and allows only declining below it', async () => {
    renderWithProviders(
      <CompleteWorkflowStepDialog
        resolve={{
          proposal: { uuid: 'proposal-1' } as any,
          step: {
            uuid: 'step-1',
            step: 'allocation_decision',
            kind: 'decision',
            outcome_set: 'approval',
            is_allocation_decision: true,
            allowed_outcomes: ['approved', 'declined'],
            step_name: 'Allocation decision',
            score_gate: {
              score: 2.8,
              threshold: 3,
              source_step_name: 'Consensus report',
              passes: false,
            },
          } as any,
        }}
      />,
    );

    expect(
      screen.getByText('Score 2.8 / threshold 3 (Consensus report)'),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(
      await screen.findByRole('option', { name: 'Approved' }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('option', { name: 'Declined' }),
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  describe("an applicant's step", () => {
    const awardResponse = {
      uuid: 'step-2',
      step: 'award_response',
      kind: 'applicant_action',
      completer: 'applicant',
      outcome_set: 'acceptance',
      allowed_outcomes: ['accepted', 'declined'],
      step_name: 'Award response',
    } as any;
    const proposal = {
      uuid: 'proposal-1',
      created_by_uuid: 'applicant',
    } as any;

    it('asks someone outside the team why they answer for the applicant', async () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'staff',
        is_staff: true,
        permissions: [],
      } as any);
      vi.mocked(proposalProposalsCompleteWorkflowStep).mockClear();
      renderWithProviders(
        <CompleteWorkflowStepDialog
          resolve={{ proposal, step: awardResponse }}
        />,
      );

      expect(screen.getByTestId('answer-for-applicant')).toBeInTheDocument();
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.click(await screen.findByText('Accepted'));
      await user.click(screen.getByRole('button', { name: /Complete step/ }));
      expect(
        await screen.findByText('Say why you answer for the applicant.'),
      ).toBeInTheDocument();
      expect(proposalProposalsCompleteWorkflowStep).not.toHaveBeenCalled();
    });

    it('leaves the comment optional for the applicant', () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'applicant',
        permissions: [],
      } as any);
      renderWithProviders(
        <CompleteWorkflowStepDialog
          resolve={{ proposal, step: awardResponse }}
        />,
      );
      expect(
        screen.queryByTestId('answer-for-applicant'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Comment')).toBeInTheDocument();
    });

    it('asks no reason of the call team on a step the call gives it', () => {
      vi.mocked(useUser).mockReturnValue({
        uuid: 'manager',
        permissions: [],
      } as any);
      renderWithProviders(
        <CompleteWorkflowStepDialog
          resolve={{
            proposal,
            step: { ...awardResponse, completer: 'call_manager' },
          }}
        />,
      );
      expect(
        screen.queryByTestId('answer-for-applicant'),
      ).not.toBeInTheDocument();
    });
  });
});
