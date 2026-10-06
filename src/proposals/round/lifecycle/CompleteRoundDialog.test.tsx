import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRoundsComplete } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { CompleteRoundDialog } from './CompleteRoundDialog';

// The SDK client throws the parsed body with the response envelope spread
// alongside it (waldur-auth-core's error interceptor).
const thrown = (status: number, body: object) => ({
  ...body,
  response: { status } as Response,
  status,
  statusText: 'Bad Request',
  url: 'http://localhost/api/complete/',
});

const round = {
  uuid: 'round-uuid',
  name: 'Round 1',
  lifecycle_state: 'results_published',
  undecided_at_round_completion: null,
} as any;
const call = {
  uuid: 'call-uuid',
  undecided_at_round_completion: 'refuse',
} as any;
const path = { uuid: 'call-uuid', obj_uuid: 'round-uuid' };

const renderDialog = (roundProps = {}, callProps = {}, refetch = vi.fn()) =>
  renderWithProviders(
    <CompleteRoundDialog
      resolve={{
        round: { ...round, ...roundProps },
        call: { ...call, ...callProps },
        refetch,
      }}
    />,
  );

const completeButton = () =>
  screen.getByRole('button', { name: 'Complete round' });

describe('CompleteRoundDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("states the call's rule and completes when nothing is left", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsRoundsComplete).mockResolvedValue({
      data: { rejected_proposals: [], failed_proposals: [] },
    } as any);
    renderDialog({}, {}, refetch);

    expect(
      screen.getByText(/Block completion until every proposal is decided/),
    ).toHaveTextContent("the call's setting");
    await user.click(completeButton());

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsComplete).toHaveBeenCalledWith({
        path,
      }),
    );
    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the undecided count and stays open when completion is refused', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsComplete).mockRejectedValue(
      thrown(400, { detail: 'Decide them first.', undecided_count: 3 }),
    );
    renderDialog();

    await user.click(completeButton());

    expect(
      await screen.findByText('3 proposal(s) have no decision yet'),
    ).toBeInTheDocument();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('explains a refusal caused by decisions still held', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsComplete).mockRejectedValue(
      thrown(400, { detail: 'Publish again first.', held_decisions_count: 2 }),
    );
    renderDialog();

    await user.click(completeButton());

    expect(await screen.findByTestId('held-refusal')).toHaveTextContent(
      '2 decision(s) are still held',
    );
    expect(screen.queryByTestId('undecided-refusal')).not.toBeInTheDocument();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });

  it('reloads the rounds on a refusal caused by held decisions', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsRoundsComplete).mockRejectedValue(
      thrown(400, { detail: 'Publish again first.', held_decisions_count: 2 }),
    );
    renderDialog({}, {}, refetch);

    await user.click(completeButton());

    await screen.findByTestId('held-refusal');
    expect(refetch).toHaveBeenCalled();
  });

  it("warns that the round's own rule rejects undecided proposals", () => {
    renderDialog({ undecided_at_round_completion: 'reject' });
    expect(screen.getByTestId('reject-warning')).toBeInTheDocument();
    expect(screen.getByText(/Reject them automatically/)).toHaveTextContent(
      'set for this round',
    );
  });

  it('lists the rejected proposals after completing', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsComplete).mockResolvedValue({
      data: {
        rejected_proposals: [{ uuid: 'p1', name: 'Quantum materials' }],
        failed_proposals: [],
      },
    } as any);
    renderDialog({}, { undecided_at_round_completion: 'reject' });

    await user.click(completeButton());

    expect(await screen.findByTestId('rejected-proposals')).toHaveTextContent(
      'Quantum materials',
    );
    expect(
      screen.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();
  });

  it('offers a retry when some rejections failed', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsComplete).mockResolvedValue({
      data: {
        rejected_proposals: [],
        failed_proposals: [{ uuid: 'p2', name: 'Battery materials' }],
      },
    } as any);
    renderDialog({}, { undecided_at_round_completion: 'reject' });

    await user.click(completeButton());

    expect(await screen.findByTestId('failed-proposals')).toHaveTextContent(
      'Battery materials',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(proposalProtectedCallsRoundsComplete).toHaveBeenCalledTimes(2),
    );
  });

  it('shows a refusal of the retry on the outcome screen', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsComplete)
      .mockResolvedValueOnce({
        data: {
          rejected_proposals: [],
          failed_proposals: [{ uuid: 'p2', name: 'Battery materials' }],
        },
      } as any)
      .mockRejectedValueOnce(
        thrown(400, { detail: 'Decide them first.', undecided_count: 1 }),
      );
    renderDialog({}, { undecided_at_round_completion: 'reject' });

    await user.click(completeButton());
    await screen.findByTestId('failed-proposals');
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByTestId('undecided-refusal')).toHaveTextContent(
      '1 proposal(s) have no decision yet',
    );
  });
});
