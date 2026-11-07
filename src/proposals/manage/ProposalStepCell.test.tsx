import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalStepCell, useProposalStepOwner } from './ProposalStepCell';

const Owner = (props: { step: string; decisionHeld?: boolean | null }) => (
  <>{useProposalStepOwner('call-uuid', props.step, props.decisionHeld)}</>
);

const HELD_NOTE = 'Held until the round publishes results';

describe('ProposalStepCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
      data: [
        {
          uuid: 'decision',
          key: 'allocation_decision',
          name: 'Allocation decision',
          kind: 'decision',
          completer: 'call_manager',
          is_allocation_decision: true,
        },
        {
          uuid: 'report',
          key: 'individual-report',
          name: 'Individual report',
          kind: 'assessment',
          completer: 'reviewer',
        },
      ],
    } as any);
  });

  it('says a held decision waits for the round instead of naming who acts', async () => {
    renderWithProviders(<Owner step="allocation_decision" decisionHeld />);
    expect(await screen.findByText(HELD_NOTE)).toBeInTheDocument();
    expect(screen.queryByText('Call manager')).not.toBeInTheDocument();
  });

  it.each([false, null, undefined])(
    'names who acts when decision_held is %s',
    async (decisionHeld) => {
      renderWithProviders(
        <Owner step="allocation_decision" decisionHeld={decisionHeld} />,
      );
      expect(await screen.findByText('Call manager')).toBeInTheDocument();
      expect(screen.queryByText(HELD_NOTE)).not.toBeInTheDocument();
    },
  );

  // The call names its own steps; the list shows that name, not the key.
  it("shows a custom step by the call's name for it", async () => {
    renderWithProviders(
      <ProposalStepCell callUuid="call-uuid" step="individual-report" />,
    );
    expect(await screen.findByText('Individual report')).toBeInTheDocument();
    expect(screen.queryByText('individual-report')).not.toBeInTheDocument();
    // One line: who acts is in the row's details, not under the step.
    expect(screen.queryByText('Reviewer')).not.toBeInTheDocument();
  });
});
