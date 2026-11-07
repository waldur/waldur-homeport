import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsList,
  proposalProtectedCallsWorkflowStepsPartialUpdate,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { inActionsMenu, renderWithProviders } from '@/test/harness';

import {
  getRoundsAtRisk,
  isPathChanged,
  swapWithNeighbour,
} from './pathChangeImpact';
import { WorkflowStepMoveAction } from './WorkflowStepMoveAction';
import { WorkflowStepToggleAction } from './WorkflowStepToggleAction';

const steps = [
  { uuid: 'check', order: 0, name: 'Eligibility check', is_enabled: true },
  { uuid: 'report', order: 1, name: 'Reviewer report', is_enabled: true },
  { uuid: 'panel', order: 2, name: 'Panel meeting', is_enabled: true },
  { uuid: 'decision', order: 3, name: 'Decision', is_enabled: true },
] as any[];

const rounds = [
  { uuid: 'round-x', name: 'Round X', status: 'open', lifecycle_state: null },
  {
    uuid: 'round-y',
    name: 'Round Y',
    status: 'ended',
    lifecycle_state: 'evaluating',
  },
  // Past evaluation: no proposals of it can end up on two paths.
  {
    uuid: 'round-z',
    name: 'Round Z',
    status: 'ended',
    lifecycle_state: 'closed',
  },
];

const callWithRounds = { uuid: 'call-uuid', rounds } as any;

const countResponse = (count: number) =>
  ({
    data: [],
    response: { headers: new Headers({ 'x-result-count': String(count) }) },
  }) as any;

const mockSubmitted = (byRound: Record<string, number>) =>
  vi
    .mocked(proposalProposalsList)
    .mockImplementation(({ query }: any) =>
      Promise.resolve(countResponse(byRound[query.round_uuid] ?? 0)),
    );

const renderMove = (row, direction: 'up' | 'down', call = callWithRounds) =>
  renderWithProviders(
    inActionsMenu(
      <WorkflowStepMoveAction
        row={row}
        call={call}
        steps={steps}
        direction={direction}
        refetch={vi.fn()}
      />,
    ),
  );

const confirmBody = () =>
  render(vi.mocked(useModal().confirm).mock.calls[0][1] as ReactElement);

describe('path change helpers', () => {
  it('moves a step one place in either direction', () => {
    expect(swapWithNeighbour(steps, 'panel', 'up').map((s) => s.uuid)).toEqual([
      'check',
      'panel',
      'report',
      'decision',
    ]);
    expect(
      swapWithNeighbour(steps, 'check', 'down').map((s) => s.uuid),
    ).toEqual(['report', 'check', 'panel', 'decision']);
  });

  it('a move among disabled steps leaves the path as it is', () => {
    const withDisabled = steps.map((s) =>
      s.uuid === 'report' || s.uuid === 'panel'
        ? { ...s, is_enabled: false }
        : s,
    );
    expect(
      isPathChanged({
        kind: 'order',
        before: withDisabled,
        after: swapWithNeighbour(withDisabled, 'panel', 'up'),
        changedUuid: 'panel',
      }),
    ).toBe(false);
  });

  it('only open and evaluating rounds are at risk', () => {
    expect(getRoundsAtRisk(callWithRounds).map((r) => r.uuid)).toEqual([
      'round-x',
      'round-y',
    ]);
  });
});

describe('moving a step on a call with proposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  it('saves without a dialog when nothing has been submitted', async () => {
    const user = userEvent.setup();
    mockSubmitted({});
    renderMove(steps[2], 'up');

    await user.click(screen.getByText('Move up'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalled(),
    );
    expect(useModal().confirm).not.toHaveBeenCalled();
  });

  it('asks nothing of a call without rounds in progress', async () => {
    const user = userEvent.setup();
    renderMove(steps[2], 'up', { uuid: 'call-uuid', rounds: [rounds[2]] });

    await user.click(screen.getByText('Move up'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalled(),
    );
    expect(proposalProposalsList).not.toHaveBeenCalled();
    expect(useModal().confirm).not.toHaveBeenCalled();
  });

  it('shows who keeps the old order, and the order before and after', async () => {
    const user = userEvent.setup();
    mockSubmitted({ 'round-x': 3, 'round-y': 1 });
    renderMove(steps[2], 'up');

    await user.click(screen.getByText('Move up'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'panel' },
        body: { order: 1 },
      }),
    );
    // Counted by round, among submitted and in-review proposals only.
    expect(proposalProposalsList).toHaveBeenCalledWith({
      query: expect.objectContaining({
        round_uuid: 'round-x',
        state: ['submitted', 'in_review'],
      }),
    });
    expect(useModal().confirm).toHaveBeenCalledTimes(1);

    confirmBody();
    expect(screen.getByTestId('path-change-impact')).toHaveTextContent(
      '3 proposals already submitted in round ‘Round X’ (and 1 in ‘Round Y’) keep the current order. Proposals submitted from now on follow the new order.',
    );
    expect(screen.getByTestId('path-before')).toHaveTextContent(
      'Eligibility checkReviewer reportPanel meetingDecision',
    );
    expect(screen.getByTestId('path-after')).toHaveTextContent(
      'Eligibility checkPanel meetingReviewer reportDecision',
    );
    // The moved step stands out in both sequences.
    expect(
      within(screen.getByTestId('path-after')).getByTestId('changed-step'),
    ).toHaveTextContent('Panel meeting');
    expect(
      within(screen.getByTestId('path-before')).getByTestId('changed-step'),
    ).toHaveTextContent('Panel meeting');
  });

  it('does not save when the dialog is cancelled', async () => {
    const user = userEvent.setup();
    mockSubmitted({ 'round-x': 2 });
    vi.mocked(useModal().confirm).mockRejectedValueOnce(undefined);
    renderMove(steps[1], 'down');

    await user.click(screen.getByText('Move down'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    expect(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).not.toHaveBeenCalled();
  });

  it("shows the backend's message when it refuses the move", async () => {
    const user = userEvent.setup();
    mockSubmitted({ 'round-x': 2 });
    const refusal = new Error('refused');
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockRejectedValueOnce(refusal);
    renderMove(steps[1], 'down');

    await user.click(screen.getByText('Move down'));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        refusal,
        'Unable to move workflow step.',
      ),
    );
  });
});

describe('disabling a step on a call with proposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);
    vi.mocked(
      proposalProtectedCallsWorkflowStepsPartialUpdate,
    ).mockResolvedValue({} as any);
  });

  it('shows the step leaving the path of new proposals', async () => {
    const user = userEvent.setup();
    mockSubmitted({ 'round-x': 1 });
    renderWithProviders(
      inActionsMenu(
        <WorkflowStepToggleAction
          row={steps[1]}
          call={callWithRounds}
          steps={steps}
          refetch={vi.fn()}
        />,
      ),
    );

    await user.click(screen.getByText('Disable'));

    await waitFor(() =>
      expect(
        proposalProtectedCallsWorkflowStepsPartialUpdate,
      ).toHaveBeenCalled(),
    );
    confirmBody();
    expect(screen.getByTestId('path-change-impact')).toHaveTextContent(
      '1 proposal already submitted in round ‘Round X’ keeps the current steps.',
    );
    expect(screen.getByTestId('path-after')).toHaveTextContent(
      'Eligibility checkPanel meetingDecision',
    );
  });
});
