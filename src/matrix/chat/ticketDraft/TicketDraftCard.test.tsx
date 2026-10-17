import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  matrixTicketDraftsCancel,
  matrixTicketDraftsCreateIssue,
  matrixTicketDraftsRetrieve,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { TicketDraft, TicketDraftOutcome } from './parseTicketDraft';
import { TicketDraftCard } from './TicketDraftCard';

const inFuture = () => new Date(Date.now() + 10 * 60 * 1000).toISOString();

const makeDraft = (overrides: Partial<TicketDraft> = {}): TicketDraft => ({
  draftUuid: 'd1',
  requester: '@alice:chat.example.com',
  title: 'VM does not boot',
  description: 'See [this](https://evil.example.com) <b>now</b>',
  requestType: 'Incident',
  priority: 'High',
  helpdesk: 'Service desk',
  project: {
    uuid: 'p1',
    name: 'Project',
    customerUuid: 'c1',
    customerName: 'Org',
  },
  resource: { uuid: 'r1', name: 'vm-1' },
  expiresAt: inFuture(),
  ...overrides,
});

/** The draft as Waldur returns it to its requester. */
const serverDraft = (overrides: Record<string, unknown> = {}) => ({
  uuid: 'd1',
  state: 'pending',
  title: 'VM does not boot',
  description: 'See [this](https://evil.example.com) <b>now</b>',
  request_type: 'Incident',
  priority: 'High',
  project_uuid: 'p1',
  project_name: 'Project',
  customer_uuid: 'c1',
  customer_name: 'Org',
  resource_uuid: 'r1',
  resource_name: 'vm-1',
  resource_offering_name: 'VMs',
  helpdesk: 'Service desk',
  expires_at: inFuture(),
  ...overrides,
});

const notFound = () =>
  Object.assign(new Error('Not found'), { response: { status: 404 } });

/** A refusal as the API client throws it: the body, with the status beside it. */
const apiError = (status: number, statusText: string, body: object) => ({
  ...body,
  response: { status },
  status,
  statusText,
  url: 'https://api/matrix-ticket-drafts/d1/create_issue/',
});

const renderCard = (
  draft: TicketDraft,
  isRequester: boolean,
  outcome?: TicketDraftOutcome,
) =>
  renderWithProviders(
    <TicketDraftCard
      draft={draft}
      isRequester={isRequester}
      outcome={outcome}
    />,
  );

describe('TicketDraftCard', () => {
  beforeEach(() => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockReset();
    vi.mocked(matrixTicketDraftsCancel).mockReset();
    vi.mocked(matrixTicketDraftsRetrieve)
      .mockReset()
      .mockResolvedValue({ data: serverDraft() } as any);
    vi.mocked(useModal().openDialog).mockClear();
    vi.mocked(useNotify().showError).mockClear();
    vi.mocked(useNotify().showErrorResponse).mockClear();
  });

  it('shows the requester the draft and where it goes', async () => {
    renderCard(makeDraft(), true);
    expect(await screen.findByText('VM does not boot')).toBeInTheDocument();
    expect(matrixTicketDraftsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'd1' },
    });
    expect(screen.getByText('Incident')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('vm-1')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A summary of this conversation will be sent to Service desk.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Expires at/)).toBeInTheDocument();
  });

  it('shows the requester Waldur’s text, not the event’s', async () => {
    vi.mocked(matrixTicketDraftsRetrieve).mockResolvedValue({
      data: serverDraft({
        title: 'Real title',
        description: 'Real description',
        resource_uuid: null,
        resource_name: '',
      }),
    } as any);
    renderCard(
      makeDraft({ title: 'Forged title', description: 'Forged text' }),
      true,
    );
    expect(await screen.findByText('Real title')).toBeInTheDocument();
    expect(screen.getByText('Real description')).toBeInTheDocument();
    expect(screen.queryByText('Forged title')).toBeNull();
    expect(screen.queryByText('vm-1')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Create ticket' }),
    ).toBeInTheDocument();
  });

  it('gives the requester no actions on a draft Waldur doesn’t give them', async () => {
    vi.mocked(matrixTicketDraftsRetrieve).mockRejectedValue(notFound());
    renderCard(makeDraft({ title: 'Forged title' }), true);
    expect(
      await screen.findByText('This draft can no longer be sent from here.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('shows the requester what Waldur says became of the draft', async () => {
    vi.mocked(matrixTicketDraftsRetrieve).mockResolvedValue({
      data: serverDraft({
        state: 'sent',
        title: '',
        description: '',
        issue_uuid: 'i9',
        issue_key: 'SD-9',
      }),
    } as any);
    renderCard(makeDraft(), true);
    expect(
      await screen.findByRole('link', { name: 'Ticket SD-9 created.' }),
    ).toBeInTheDocument();
    // Waldur erased the text; the card keeps the event's.
    expect(screen.getByText('VM does not boot')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
  });

  it('offers another try when the draft can’t be loaded', async () => {
    vi.mocked(matrixTicketDraftsRetrieve).mockRejectedValue(
      Object.assign(new Error('Bad gateway'), { response: { status: 502 } }),
    );
    renderCard(makeDraft(), true);
    expect(
      await screen.findByText("Couldn't load this draft.", undefined, {
        timeout: 10000,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    let answer: (value: unknown) => void = () => undefined;
    vi.mocked(matrixTicketDraftsRetrieve).mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }) as any,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    // The click shows: the card waits for the answer.
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load this draft.")).toBeNull();
    act(() => answer({ data: serverDraft() }));
    expect(
      await screen.findByRole('button', { name: 'Create ticket' }),
    ).toBeInTheDocument();
  }, 15000);

  it('is named by its title and lets the keyboard scroll its description', () => {
    renderCard(makeDraft(), false);
    expect(
      screen.getByRole('group', { name: 'VM does not boot' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('See [this](https://evil.example.com) <b>now</b>'),
    ).toHaveAttribute('tabindex', '0');
  });

  it('shows the description as written: no links, no markup', () => {
    const { container } = renderCard(makeDraft(), false);
    expect(
      screen.getByText('See [this](https://evil.example.com) <b>now</b>'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('b')).toBeNull();
  });

  it('lets the requester create the ticket', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockResolvedValue({
      data: { issue_key: 'SD-42', issue_uuid: 'i1', issue_url: '/x' },
    } as any);
    const { queryClient } = renderCard(makeDraft(), true);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    );
    expect(matrixTicketDraftsCreateIssue).toHaveBeenCalledWith({
      path: { uuid: 'd1' },
      body: {},
    });
    expect(
      await screen.findByRole('link', { name: 'Ticket SD-42 created.' }),
    ).toBeInTheDocument();
    // `ticket send` is no longer the composer's to offer.
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['MatrixRoomCommands'],
    });
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('keeps the buttons and asks Waldur again when creating fails on the server', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue(
      apiError(502, 'Bad Gateway', {}),
    );
    renderCard(makeDraft(), true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    );
    await waitFor(() =>
      expect(matrixTicketDraftsRetrieve).toHaveBeenCalledTimes(2),
    );
    expect(
      await screen.findByRole('button', { name: 'Create ticket' }),
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(
      screen.queryByText('This draft can no longer be sent from here.'),
    ).toBeNull();
  });

  it('turns read-only when Waldur no longer has the draft to create', async () => {
    // Asked again, Waldur may still list it as pending: the refusal stands.
    vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue(
      apiError(404, 'Not Found', { detail: 'Not found.' }),
    );
    renderCard(makeDraft(), true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    );
    expect(
      await screen.findByText('This draft can no longer be sent from here.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('turns read-only when asking again finds the draft gone', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue(
      apiError(409, 'Conflict', { detail: 'The helpdesk is not set up.' }),
    );
    renderCard(makeDraft(), true);
    const button = await screen.findByRole('button', { name: 'Create ticket' });
    vi.mocked(matrixTicketDraftsRetrieve).mockRejectedValue(
      apiError(404, 'Not Found', { detail: 'Not found.' }),
    );
    await userEvent.click(button);
    expect(
      await screen.findByText('This draft can no longer be sent from here.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
  });

  it('turns read-only when Edit finds the draft gone', async () => {
    renderCard(makeDraft(), true);
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const [, options] = vi.mocked(useModal().openDialog).mock.calls[0];
    act(() =>
      options.resolve.onFailed(
        apiError(404, 'Not Found', { detail: 'Not found.' }),
      ),
    );
    expect(
      await screen.findByText('This draft can no longer be sent from here.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it.each([
    [
      '404',
      apiError(404, 'Not Found', {
        detail:
          'The ticket draft expired; nothing was sent. Send !ticket to make a new one.',
      }),
      'The ticket draft expired; nothing was sent. Send !ticket to make a new one.',
    ],
    [
      '409',
      apiError(409, 'Conflict', { detail: 'The helpdesk is not set up.' }),
      'The helpdesk is not set up.',
    ],
    [
      '400 on a field',
      apiError(400, 'Bad Request', {
        resource_uuid: ["Not a resource of the room's project."],
      }),
      "resource_uuid: Not a resource of the room's project.",
    ],
    [
      '400 as a list',
      apiError(400, 'Bad Request', { ...['The helpdesk refused the issue.'] }),
      'The helpdesk refused the issue.',
    ],
    [
      '403',
      apiError(403, 'Forbidden', {
        detail: 'You do not have permission to perform this action.',
      }),
      'You do not have permission to perform this action.',
    ],
  ])(
    'says why Waldur refused to create the ticket: %s',
    async (_, error, why) => {
      vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue(error);
      renderCard(makeDraft(), true);
      await userEvent.click(
        await screen.findByRole('button', { name: 'Create ticket' }),
      );
      await waitFor(() =>
        expect(useNotify().showError).toHaveBeenCalledWith(
          `Unable to create the support ticket. ${why}`,
        ),
      );
      expect(useNotify().showErrorResponse).not.toHaveBeenCalled();
    },
  );

  it('falls back to the shared error text when the reply has no reason', async () => {
    const error = new TypeError('Failed to fetch');
    vi.mocked(matrixTicketDraftsCreateIssue).mockRejectedValue(error);
    renderCard(makeDraft(), true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    );
    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to create the support ticket.',
      ),
    );
    expect(useNotify().showError).not.toHaveBeenCalled();
  });

  it('lets the requester cancel the draft', async () => {
    vi.mocked(matrixTicketDraftsCancel).mockResolvedValue({
      data: undefined,
    } as any);
    const { queryClient } = renderCard(makeDraft(), true);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel draft' }),
    );
    expect(matrixTicketDraftsCancel).toHaveBeenCalledWith({
      path: { uuid: 'd1' },
    });
    expect(
      await screen.findByText('This draft was cancelled.'),
    ).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['MatrixRoomCommands'],
    });
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel draft' })).toBeNull();
  });

  it('turns read-only when Waldur no longer has the draft to cancel', async () => {
    vi.mocked(matrixTicketDraftsCancel).mockRejectedValue(
      apiError(404, 'Not Found', { detail: 'The ticket draft expired.' }),
    );
    renderCard(makeDraft(), true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel draft' }),
    );
    expect(
      await screen.findByText('This draft can no longer be sent from here.'),
    ).toBeInTheDocument();
    expect(useNotify().showError).toHaveBeenCalledWith(
      'Unable to cancel the ticket draft. The ticket draft expired.',
    );
    expect(screen.queryByRole('button', { name: 'Cancel draft' })).toBeNull();
  });

  it('keeps the buttons when cancelling fails on the server', async () => {
    vi.mocked(matrixTicketDraftsCancel).mockRejectedValue(
      apiError(502, 'Bad Gateway', {}),
    );
    renderCard(makeDraft(), true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Cancel draft' }),
    );
    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.objectContaining({ status: 502 }),
        'Unable to cancel the ticket draft.',
      ),
    );
    expect(
      await screen.findByRole('button', { name: 'Cancel draft' }),
    ).toBeEnabled();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('offers no cancel while the ticket is being created', async () => {
    vi.mocked(matrixTicketDraftsCreateIssue).mockReturnValue(
      new Promise(() => undefined) as any,
    );
    renderCard(makeDraft(), true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Create ticket' }),
    );
    expect(screen.getByRole('button', { name: 'Cancel draft' })).toBeDisabled();
  });

  it('opens the support form with Waldur’s draft for Edit', async () => {
    vi.mocked(matrixTicketDraftsRetrieve).mockResolvedValue({
      data: serverDraft({ title: 'Real title' }),
    } as any);
    renderCard(makeDraft({ title: 'Forged title' }), true);
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const [, options] = vi.mocked(useModal().openDialog).mock.calls[0];
    expect(options.resolve.draft).toMatchObject({
      draftUuid: 'd1',
      title: 'Real title',
      resource: { uuid: 'r1', offeringName: 'VMs' },
    });
  });

  it('asks Waldur again after a ticket is created through Edit', async () => {
    const { queryClient } = renderCard(makeDraft(), true);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    expect(matrixTicketDraftsRetrieve).toHaveBeenCalledTimes(1);
    const [, options] = vi.mocked(useModal().openDialog).mock.calls[0];
    vi.mocked(matrixTicketDraftsRetrieve).mockResolvedValue({
      data: serverDraft({ state: 'sent', issue_uuid: 'i5', issue_key: 'SD-5' }),
    } as any);
    act(() =>
      options.resolve.onCreated({
        issue_uuid: 'i5',
        issue_key: 'SD-5',
        issue_url: '/x',
      }),
    );
    await waitFor(() =>
      expect(matrixTicketDraftsRetrieve).toHaveBeenCalledTimes(2),
    );
    expect(
      await screen.findByRole('link', { name: 'Ticket SD-5 created.' }),
    ).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['MatrixRoomCommands'],
    });
  });

  it('shows no actions to other members and does not ask Waldur', () => {
    renderCard(makeDraft(), false);
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    expect(
      screen.getByText('Only the member who asked for this draft can send it.'),
    ).toBeInTheDocument();
    expect(matrixTicketDraftsRetrieve).not.toHaveBeenCalled();
  });

  describe('while the card is open', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const renderExpiringIn = async (ms: number) => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const expiresAt = new Date(Date.now() + ms).toISOString();
      vi.mocked(matrixTicketDraftsRetrieve).mockResolvedValue({
        data: serverDraft({ expires_at: expiresAt }),
      } as any);
      renderCard(makeDraft({ expiresAt }), true);
      await screen.findByRole('button', { name: 'Create ticket' });
    };

    it('takes the buttons away when the draft expires', async () => {
      await renderExpiringIn(5 * 60 * 1000);
      await act(() => vi.advanceTimersByTimeAsync(5 * 60 * 1000));
      expect(screen.getByText('This draft has expired.')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Create ticket' }),
      ).toBeNull();
    });

    it('keeps them for a draft that expires in weeks', async () => {
      // Beyond what one setTimeout can wait: it would fire at once.
      await renderExpiringIn(30 * 24 * 60 * 60 * 1000);
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(screen.queryByText('This draft has expired.')).toBeNull();
      expect(
        screen.getByRole('button', { name: 'Create ticket' }),
      ).toBeInTheDocument();
    });
  });

  it('shows a draft past its expiry as expired', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    vi.mocked(matrixTicketDraftsRetrieve).mockResolvedValue({
      data: serverDraft({ expires_at: past }),
    } as any);
    renderCard(makeDraft({ expiresAt: past }), true);
    expect(
      await screen.findByText('This draft has expired.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
    expect(screen.queryByText(/^Expires at/)).toBeNull();
  });

  it('shows a created ticket as the requester sent it', async () => {
    renderCard(makeDraft(), false, {
      state: 'created',
      issueKey: 'SD-7',
      edits: {
        title: 'Edited title',
        description: 'Edited text',
        resource: null,
      },
    });
    expect(await screen.findByText('Edited text')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Edited title' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('vm-1')).toBeNull();
    // What was left alone stays the bot's.
    expect(screen.getByText('Incident')).toBeInTheDocument();
  });

  it.each([
    [{ state: 'cancelled' }, 'This draft was cancelled.'],
    [{ state: 'expired' }, 'This draft has expired.'],
    [{ state: 'created', issueKey: 'SD-7' }, 'Ticket SD-7 created.'],
  ] as Array<[TicketDraftOutcome, string]>)(
    'shows what the bot reported: %o',
    async (outcome, text) => {
      renderCard(makeDraft(), true, outcome);
      expect(await screen.findByText(text)).toBeInTheDocument();
      // A closed draft isn't asked for again.
      expect(matrixTicketDraftsRetrieve).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull(),
      );
    },
  );
});
