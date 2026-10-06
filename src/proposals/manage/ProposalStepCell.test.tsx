import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsWorkflowStepsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalStepCell } from './ProposalStepCell';

const HELD_NOTE = 'Held until the round publishes results';

describe('ProposalStepCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProtectedCallsWorkflowStepsList).mockResolvedValue({
      data: [],
    } as any);
  });

  it('says a held decision waits for the round instead of naming who acts', () => {
    renderWithProviders(
      <ProposalStepCell
        callUuid="call-uuid"
        step="allocation_decision"
        decisionHeld
      />,
    );
    expect(screen.getByText(HELD_NOTE)).toBeInTheDocument();
    expect(screen.queryByText('Call manager')).not.toBeInTheDocument();
  });

  it.each([false, null, undefined])(
    'names who acts when decision_held is %s',
    (decisionHeld) => {
      renderWithProviders(
        <ProposalStepCell
          callUuid="call-uuid"
          step="allocation_decision"
          decisionHeld={decisionHeld}
        />,
      );
      expect(screen.queryByText(HELD_NOTE)).not.toBeInTheDocument();
      expect(screen.getByText('Call manager')).toBeInTheDocument();
    },
  );
});
