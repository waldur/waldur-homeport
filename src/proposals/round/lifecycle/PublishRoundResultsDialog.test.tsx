import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRoundsPublishResults } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { PublishRoundResultsDialog } from './PublishRoundResultsDialog';

const round = { uuid: 'round-uuid', name: 'Round 1' } as any;
const call = { uuid: 'call-uuid', publish_results: 'with_round' } as any;
const path = { uuid: 'call-uuid', obj_uuid: 'round-uuid' };

// The SDK client throws the parsed body with the response envelope spread
// alongside it (waldur-auth-core's error interceptor).
const thrown = (status: number, body: object) => ({
  ...body,
  response: { status } as Response,
  status,
  statusText: 'Bad Request',
  url: 'http://localhost/api/publish_results/',
});

const refusal = thrown(400, {
  detail:
    '2 proposal(s) of this round have no decision yet. Decide them first, or publish with force and a reason.',
  undecided_count: 2,
});

const renderDialog = (refetch = vi.fn(), roundProps = {}) =>
  renderWithProviders(
    <PublishRoundResultsDialog
      resolve={{ round: { ...round, ...roundProps }, call, refetch }}
    />,
  );

describe('PublishRoundResultsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes and closes when every decision is made', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProtectedCallsRoundsPublishResults).mockResolvedValue({
      data: { failed_proposals: [] },
    } as any);
    renderDialog(refetch);

    await user.click(screen.getByRole('button', { name: 'Publish results' }));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsPublishResults).toHaveBeenCalledWith({
        path,
        body: { force: false },
      }),
    );
    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the undecided count and publishes with force and a reason', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsPublishResults)
      .mockRejectedValueOnce(refusal)
      .mockResolvedValueOnce({ data: { failed_proposals: [] } } as any);
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Publish results' }));

    expect(
      await screen.findByText(
        '2 proposal(s) of this round have no decision yet',
      ),
    ).toBeInTheDocument();
    expect(useModal().closeDialog).not.toHaveBeenCalled();

    // The reason is required before publishing anyway.
    expect(
      screen.getByRole('button', { name: 'Publish anyway' }),
    ).toBeDisabled();

    await user.type(screen.getByRole('textbox'), 'Board adopted the list');
    expect(
      screen.getByRole('button', { name: 'Publish anyway' }),
    ).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Publish anyway' }));

    await waitFor(() =>
      expect(
        proposalProtectedCallsRoundsPublishResults,
      ).toHaveBeenLastCalledWith({
        path,
        body: { force: true, reason: 'Board adopted the list' },
      }),
    );
  });

  it('lists the proposals whose decision could not be carried out', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsPublishResults).mockResolvedValue({
      data: {
        failed_proposals: [{ uuid: 'p1', name: 'Quantum materials' }],
      },
    } as any);
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Publish results' }));

    expect(await screen.findByText('Quantum materials')).toBeInTheDocument();
    expect(useModal().closeDialog).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('offers no force for a refusal without an undecided count', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsPublishResults).mockRejectedValue(
      thrown(400, ['The round is Closed, so this step does not apply.']),
    );
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Publish results' }));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsPublishResults).toHaveBeenCalled(),
    );
    expect(screen.queryByTestId('undecided-refusal')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Publish anyway' }),
    ).not.toBeInTheDocument();
  });

  it('retries the held decisions of a round whose results are out', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsPublishResults).mockResolvedValue({
      data: { failed_proposals: [] },
    } as any);
    renderDialog(vi.fn(), {
      lifecycle_state: 'results_published',
      held_decisions_count: 1,
    });

    expect(screen.getByTestId('republish-note')).toHaveTextContent(
      '1 decision(s) of this round could not be carried out',
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsPublishResults).toHaveBeenCalledWith({
        path,
        body: { force: false },
      }),
    );
  });

  it('retries a forced publication without forcing again', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProtectedCallsRoundsPublishResults)
      .mockRejectedValueOnce(refusal)
      .mockResolvedValueOnce({
        data: { failed_proposals: [{ uuid: 'p1', name: 'Quantum materials' }] },
      } as any)
      .mockResolvedValueOnce({ data: { failed_proposals: [] } } as any);
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Publish results' }));
    await user.type(
      await screen.findByRole('textbox'),
      'Board adopted the list',
    );
    await user.click(screen.getByRole('button', { name: 'Publish anyway' }));
    expect(await screen.findByText('Quantum materials')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(proposalProtectedCallsRoundsPublishResults).toHaveBeenCalledTimes(
        3,
      ),
    );
    expect(proposalProtectedCallsRoundsPublishResults).toHaveBeenLastCalledWith(
      { path, body: { force: false } },
    );
    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
  });
});
