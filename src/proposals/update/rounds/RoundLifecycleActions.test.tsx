import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProtectedCallsRoundsClose,
  proposalProtectedCallsRoundsStartDeciding,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { RoundLifecycleActions } from './RoundLifecycleActions';

const call = {
  uuid: 'call-uuid',
  state: 'active',
  publish_results: 'with_round',
  carry_over_drafts: false,
} as any;

const makeRound = (overrides: Record<string, unknown>) =>
  ({
    uuid: 'round-uuid',
    name: 'Round 1',
    status: 'ended',
    lifecycle_state: 'evaluating',
    adopted_at: null,
    ...overrides,
  }) as any;

const renderActions = (
  round: any,
  refetch = vi.fn(),
  callProps = {},
  access = { canCloseRounds: true, canUpdate: true },
) =>
  renderWithProviders(
    inActionsMenu(
      <RoundLifecycleActions
        row={round}
        call={{ ...call, ...callProps }}
        refetch={refetch}
        {...access}
      />,
    ),
  );

const titles = () =>
  [
    'Close round',
    'Start deciding',
    'Publish results',
    'Complete round',
    'Record adoption',
  ]
    .filter((title) => screen.queryByText(title))
    .sort();

describe('RoundLifecycleActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['scheduled', null, []],
    ['open', null, ['Close round']],
    [
      'ended',
      'evaluating',
      ['Publish results', 'Record adoption', 'Start deciding'],
    ],
    ['ended', 'deciding', ['Publish results', 'Record adoption']],
    ['ended', 'results_published', ['Complete round', 'Record adoption']],
    [
      'ended',
      'results_published',
      ['Complete round', 'Publish results', 'Record adoption'],
      2,
    ],
    ['ended', 'closed', ['Record adoption']],
  ])(
    'offers only the valid actions for a %s round in %s',
    (status, lifecycle_state, expected, held_decisions_count = 0) => {
      renderActions(
        makeRound({ status, lifecycle_state, held_decisions_count }),
      );
      expect(titles()).toEqual(expected);
    },
  );

  it('closes an open round after a confirmation naming what happens to drafts', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsRoundsClose).mockResolvedValue({
      data: 'Round has been closed.',
    } as any);
    renderActions(
      makeRound({ status: 'open', lifecycle_state: null }),
      refetch,
      {
        carry_over_drafts: true,
      },
    );

    await user.click(screen.getByText('Close round'));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsClose).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'round-uuid' },
        body: {},
      }),
    );
    const [, body] = vi.mocked(useModal().confirm).mock.lastCall as any;
    expect(body).toContain("move to the call's next round");
    expect(body).toContain('Evaluation of the submitted proposals starts.');
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('says drafts are cancelled when the call does not carry them over', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsClose).mockResolvedValue({
      data: '',
    } as any);
    renderActions(makeRound({ status: 'open', lifecycle_state: null }));

    await user.click(screen.getByText('Close round'));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    const [, body] = vi.mocked(useModal().confirm).mock.lastCall as any;
    expect(body).toContain('Unsubmitted drafts are cancelled.');
  });

  it('does not close a round of a call that is not active', async () => {
    const user = userEvent.setup();
    renderActions(
      makeRound({ status: 'open', lifecycle_state: null }),
      vi.fn(),
      { state: 'draft' },
    );

    await user.click(screen.getByText('Close round'));

    expect(proposalProtectedCallsRoundsClose).not.toHaveBeenCalled();
  });

  it('starts the decision stage after confirmation', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsRoundsStartDeciding).mockResolvedValue({
      data: {},
    } as any);
    renderActions(makeRound({ lifecycle_state: 'evaluating' }), refetch);

    await user.click(screen.getByText('Start deciding'));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsStartDeciding).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid', obj_uuid: 'round-uuid' },
      }),
    );
    expect(vi.mocked(useModal().confirm)).toHaveBeenCalled();
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('opens the completion dialog for a round whose results are published', async () => {
    const user = userEvent.setup();
    renderActions(makeRound({ lifecycle_state: 'results_published' }));

    await user.click(screen.getByText('Complete round'));

    const [, dialogProps] = vi.mocked(useModal().openDialog).mock
      .lastCall as any;
    expect(dialogProps.resolve.round.uuid).toBe('round-uuid');
  });

  it('blocks completion while decisions are held', async () => {
    const user = userEvent.setup();
    renderActions(
      makeRound({
        lifecycle_state: 'results_published',
        held_decisions_count: 1,
      }),
    );

    await user.click(screen.getByText('Complete round'));

    expect(useModal().openDialog).not.toHaveBeenCalled();
  });

  it('lets the completion rule be set until the round is completed', () => {
    renderActions(makeRound({ lifecycle_state: 'deciding' }));
    expect(screen.getByText('Undecided proposals rule')).toBeInTheDocument();
  });

  it('hides the completion rule on a completed round', () => {
    renderActions(makeRound({ lifecycle_state: 'closed' }));
    expect(
      screen.queryByText('Undecided proposals rule'),
    ).not.toBeInTheDocument();
  });

  it('opens the publish dialog instead of publishing at once', async () => {
    const user = userEvent.setup();
    renderActions(makeRound({ lifecycle_state: 'deciding' }));

    await user.click(screen.getByText('Publish results'));

    const [, dialogProps] = vi.mocked(useModal().openDialog).mock
      .lastCall as any;
    expect(dialogProps.resolve.round.uuid).toBe('round-uuid');
  });

  it('offers to edit an adoption already recorded', () => {
    renderActions(
      makeRound({ lifecycle_state: 'closed', adopted_at: '2026-09-01' }),
    );
    expect(screen.getByText('Edit adoption record')).toBeInTheDocument();
  });

  it('offers the lifecycle but not the round setting with CALL.CLOSE_ROUNDS alone', () => {
    renderActions(
      makeRound({ lifecycle_state: 'deciding' }),
      vi.fn(),
      {},
      {
        canCloseRounds: true,
        canUpdate: false,
      },
    );
    expect(titles()).toEqual(['Publish results', 'Record adoption']);
    expect(
      screen.queryByText('Undecided proposals rule'),
    ).not.toBeInTheDocument();
  });

  it('offers only the round setting with CALL.UPDATE alone', () => {
    renderActions(
      makeRound({ lifecycle_state: 'deciding' }),
      vi.fn(),
      {},
      {
        canCloseRounds: false,
        canUpdate: true,
      },
    );
    expect(titles()).toEqual([]);
    expect(screen.getByText('Undecided proposals rule')).toBeInTheDocument();
  });

  it.each([
    ['evaluating', 'Start deciding'],
    ['evaluating', 'Publish results'],
    ['evaluating', 'Record adoption'],
    ['results_published', 'Complete round'],
  ])(
    'disables %s round action "%s" on a call that is not active',
    (lifecycle_state, title) => {
      renderActions(makeRound({ lifecycle_state }), vi.fn(), {
        state: 'draft',
      });
      expect(screen.getByRole('menuitem', { name: title })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    },
  );
});
