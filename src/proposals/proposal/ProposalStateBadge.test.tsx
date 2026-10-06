import { focusManager } from '@tanstack/react-query';
import { act, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsWorkflowStatesList } from 'waldur-js-client';

import { proposalWorkflowStatesKey } from '@/proposals/workflow/queries';
import { renderWithProviders } from '@/test/harness';

import { ProposalStateBadge } from './ProposalStateBadge';

const row = { uuid: 'proposal-uuid', state: 'in_review' as const };

describe('ProposalStateBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the tentative outcome of a held decision', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [{ step: 'allocation_decision', outcome: 'approved' }],
    } as any);
    renderWithProviders(
      <ProposalStateBadge row={{ ...row, decision_held: true }} />,
    );
    expect(await screen.findByText('Awarded (tentative)')).toBeInTheDocument();
    expect(screen.queryByText('In review')).not.toBeInTheDocument();
  });

  it('shows no interim label while the outcome loads', () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockReturnValue(
      new Promise(() => undefined) as any,
    );
    renderWithProviders(
      <ProposalStateBadge row={{ ...row, decision_held: true }} />,
    );
    expect(
      screen.getByTestId('held-decision-badge-loading'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Decision held')).not.toBeInTheDocument();
  });

  it('does not refetch the outcome when the window regains focus', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: [{ step: 'allocation_decision', outcome: 'approved' }],
    } as any);
    const { queryClient } = renderWithProviders(
      <ProposalStateBadge row={{ ...row, decision_held: true }} />,
    );
    await screen.findByText('Awarded (tentative)');
    expect(proposalProposalsWorkflowStatesList).toHaveBeenCalledTimes(1);

    // Age the cached outcome past its stale time, so that only the focus
    // setting stands between a focus event and another request per row.
    const key = proposalWorkflowStatesKey(row.uuid);
    queryClient.setQueryData(key, queryClient.getQueryData(key), {
      updatedAt: 0,
    });
    try {
      act(() => {
        focusManager.setFocused(false);
        focusManager.setFocused(true);
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(proposalProposalsWorkflowStatesList).toHaveBeenCalledTimes(1);
    } finally {
      focusManager.setFocused(undefined);
    }
  });

  it.each([null, false, undefined])(
    'shows the proposal state when decision_held is %s',
    (decision_held) => {
      renderWithProviders(
        <ProposalStateBadge row={{ ...row, decision_held }} />,
      );
      expect(
        screen.queryByTestId('held-decision-badge'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('In review')).toBeInTheDocument();
      expect(proposalProposalsWorkflowStatesList).not.toHaveBeenCalled();
    },
  );
});
