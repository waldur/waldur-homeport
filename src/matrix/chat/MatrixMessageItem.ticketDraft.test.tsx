import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { matrixTicketDraftsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { MatrixMessageItem } from './MatrixMessageItem';
import { TicketDraftOutcome } from './ticketDraft/parseTicketDraft';
import { MatrixChatMessage } from './types';

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: null }),
}));
vi.mock('./MessageReactionChips', () => ({
  MessageReactionChips: () => null,
}));
vi.mock('./MessageReactionToolbar', () => ({
  MessageReactionToolbar: () => null,
}));

const ALICE = '@alice:chat.example.com';
const BOT = '@waldur-bot:chat.example.com';

const notice = (assistantBlocks: unknown, sender = BOT): MatrixChatMessage => ({
  eventId: 'evt-1',
  sender,
  senderDisplayName: 'Waldur',
  body: 'Ticket draft: reply !ticket send to create it.',
  timestamp: 1000,
  type: 'm.notice',
  assistantBlocks,
});

const draftBlock = {
  key: 'support_ticket_draft',
  draft_uuid: 'a'.repeat(32),
  requester: ALICE,
  title: 'VM does not boot',
  description: 'It hangs.',
};

const renderItem = (
  message: MatrixChatMessage,
  currentUserId: string,
  ticketDraftOutcomes?: Map<string, TicketDraftOutcome>,
) =>
  renderWithProviders(
    <MatrixMessageItem
      message={message}
      isOwn={false}
      senderName="Waldur"
      currentUserId={currentUserId}
      ticketDraftOutcomes={ticketDraftOutcomes}
      roomBotUserId={BOT}
    />,
  );

describe('MatrixMessageItem ticket draft', () => {
  beforeEach(() => {
    vi.mocked(matrixTicketDraftsRetrieve)
      .mockReset()
      .mockResolvedValue({
        data: {
          uuid: 'a'.repeat(32),
          state: 'pending',
          title: 'VM does not boot',
          description: 'It hangs.',
          request_type: 'Incident',
          priority: '',
          project_uuid: 'p1',
          project_name: 'Project',
          customer_uuid: 'c1',
          customer_name: 'Org',
          resource_uuid: null,
          resource_name: '',
          resource_offering_name: '',
          helpdesk: 'Service desk',
          expires_at: new Date(Date.now() + 600000).toISOString(),
        },
      } as any);
  });

  it('renders the bot’s draft as a card with actions for the requester', async () => {
    renderItem(notice([draftBlock]), ALICE);
    expect(screen.getByTestId('ticket-draft-card')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Create ticket' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/!ticket send/)).toBeNull();
  });

  it('renders the card read-only for another member', () => {
    renderItem(notice([draftBlock]), '@bob:chat.example.com');
    expect(screen.getByTestId('ticket-draft-card')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
  });

  it('falls back to the body when the blocks are malformed', () => {
    renderItem(notice([{ ...draftBlock, title: 7 }]), ALICE);
    expect(screen.queryByTestId('ticket-draft-card')).toBeNull();
    expect(screen.getByText(/!ticket send/)).toBeInTheDocument();
  });

  it('falls back to the body when someone else claims to post a draft', () => {
    renderItem(notice([draftBlock], '@mallory:chat.example.com'), ALICE);
    expect(screen.queryByTestId('ticket-draft-card')).toBeNull();
    expect(screen.getByText(/!ticket send/)).toBeInTheDocument();
  });

  it('gives no actions on a card forged by a member named like a bot', () => {
    // The victim's real, pending draft, re-posted by a member: trusted, it
    // would offer them Waldur's draft to send.
    renderItem(
      notice(
        [{ ...draftBlock, title: 'Send me your password' }],
        '@waldur-bot:evil.example.com',
      ),
      ALICE,
    );
    expect(screen.queryByTestId('ticket-draft-card')).toBeNull();
    expect(screen.getByText(/!ticket send/)).toBeInTheDocument();
    expect(matrixTicketDraftsRetrieve).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
  });

  it('shows what the bot reported became of the draft', async () => {
    renderItem(
      notice([draftBlock]),
      ALICE,
      new Map([['a'.repeat(32), { state: 'cancelled' }]]),
    );
    expect(
      await screen.findByText('This draft was canceled.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create ticket' })).toBeNull();
  });
});
