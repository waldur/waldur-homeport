import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MatrixMessageActions } from './MatrixMessageActions';
import {
  MatrixMessageActions as MatrixMessageActionsValue,
  MatrixMessageActionsProvider,
} from './MatrixMessageActionsContext';
import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixChatMessage } from './types';

// Text messages and loaded reply parents never touch the Matrix client.
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: null, activeRoomId: '!room:s' }),
}));

// Chips depend on react-query / room member fetching.
vi.mock('./MessageReactionChips', () => ({
  MessageReactionChips: () => null,
}));

// The emoji row lazy-loads emoji-mart; the actions slot is what is tested.
vi.mock('./MessageReactionToolbar', () => ({
  MessageReactionToolbar: ({ children }: { children?: ReactNode }) => (
    <div role="toolbar">{children}</div>
  ),
}));

const ME = '@me:s';

const message = (
  overrides: Partial<MatrixChatMessage> = {},
): MatrixChatMessage => ({
  eventId: '$msg',
  sender: ME,
  senderDisplayName: 'Me',
  body: 'hello',
  timestamp: 1000,
  type: 'm.text',
  ...overrides,
});

const actions = (
  overrides: Partial<MatrixMessageActionsValue> = {},
): MatrixMessageActionsValue => ({
  replyTo: null,
  startReply: vi.fn(),
  cancelReply: vi.fn(),
  editingEventId: null,
  startEdit: vi.fn(),
  cancelEdit: vi.fn(),
  editLastOwnMessage: vi.fn(() => false),
  saveEdit: vi.fn(() => Promise.resolve(true)),
  deleteMessage: vi.fn(() => Promise.resolve()),
  canEdit: vi.fn(() => true),
  canDelete: vi.fn(() => true),
  ...overrides,
});

const renderItem = (
  msg: MatrixChatMessage,
  value: MatrixMessageActionsValue,
  props: Partial<Parameters<typeof MatrixMessageItem>[0]> = {},
) =>
  render(
    <MatrixMessageActionsProvider value={value}>
      <MatrixMessageItem
        message={msg}
        isOwn={msg.sender === ME}
        senderName="Me"
        currentUserId={ME}
        {...props}
      />
    </MatrixMessageActionsProvider>,
  );

describe('MatrixMessageActions', () => {
  let value: MatrixMessageActionsValue;
  beforeEach(() => {
    value = actions();
  });

  it('starts a reply', async () => {
    const user = userEvent.setup();
    const msg = message();
    render(
      <MatrixMessageActionsProvider value={value}>
        <MatrixMessageActions message={msg} />
      </MatrixMessageActionsProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Reply' }));
    expect(value.startReply).toHaveBeenCalledWith(msg);
  });

  it('offers edit and delete from the menu', async () => {
    const user = userEvent.setup();
    const msg = message();
    render(
      <MatrixMessageActionsProvider value={value}>
        <MatrixMessageActions message={msg} />
      </MatrixMessageActionsProvider>,
    );
    await user.click(
      screen.getByRole('button', { name: 'More message actions' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(value.startEdit).toHaveBeenCalledWith(msg);

    await user.click(
      screen.getByRole('button', { name: 'More message actions' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(value.deleteMessage).toHaveBeenCalledWith(msg);
  });

  it("leaves out the menu for a message the user can't change", () => {
    value = actions({ canEdit: () => false, canDelete: () => false });
    render(
      <MatrixMessageActionsProvider value={value}>
        <MatrixMessageActions message={message({ sender: '@other:s' })} />
      </MatrixMessageActionsProvider>,
    );
    expect(screen.getByRole('button', { name: 'Reply' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More message actions' }),
    ).not.toBeInTheDocument();
  });

  it('has no actions for a message still being sent', () => {
    render(
      <MatrixMessageActionsProvider value={value}>
        <MatrixMessageActions message={message({ eventId: '~txn' })} />
      </MatrixMessageActionsProvider>,
    );
    expect(
      screen.queryByRole('button', { name: 'Reply' }),
    ).not.toBeInTheDocument();
  });
});

describe('MatrixMessageItem edits, replies and deletions', () => {
  it('shows a deleted message as a placeholder without actions', () => {
    renderItem(
      message({ body: '', redacted: true, type: 'waldur.redacted' }),
      actions(),
    );
    expect(screen.getByText('Message deleted')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('marks an edited message', () => {
    renderItem(message({ body: 'fixed', edited: true }), actions());
    expect(screen.getByText('fixed')).toBeInTheDocument();
    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('edits in place: Enter saves, Escape cancels', async () => {
    const user = userEvent.setup();
    const value = actions({ editingEventId: '$msg' });
    const msg = message();
    renderItem(msg, value);

    const input = screen.getByRole('textbox', { name: 'Edit message' });
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, 'hello there{Enter}');
    expect(value.saveEdit).toHaveBeenCalledWith(msg, 'hello there');

    await user.type(input, '{Escape}');
    expect(value.cancelEdit).toHaveBeenCalled();
  });

  it('does not save an empty edit', async () => {
    const user = userEvent.setup();
    const value = actions({ editingEventId: '$msg' });
    renderItem(message(), value);
    const input = screen.getByRole('textbox', { name: 'Edit message' });
    await user.clear(input);
    await user.type(input, '{Enter}');
    expect(value.saveEdit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('quotes the replied-to message and jumps to it', async () => {
    const user = userEvent.setup();
    const parent = message({
      eventId: '$parent',
      sender: '@alice:s',
      body: 'the question',
    });
    render(
      <div className="tc-stream">
        <div data-event-id="$parent" />
        <MatrixMessageItem
          message={message({ body: 'the answer', replyToEventId: '$parent' })}
          isOwn
          senderName="Me"
          currentUserId={ME}
          replyParent={parent}
          memberNames={new Map([['@alice:s', 'Alice Example']])}
        />
      </div>,
    );
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    const quote = screen.getByRole('button', {
      name: 'Go to the message from Alice Example',
    });
    expect(quote).toHaveTextContent('the question');
    await user.click(quote);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('says so when the replied-to message is deleted', () => {
    renderItem(
      message({ body: 'the answer', replyToEventId: '$parent' }),
      actions(),
      {
        replyParent: message({
          eventId: '$parent',
          sender: '@alice:s',
          body: '',
          redacted: true,
        }),
      },
    );
    expect(screen.getByText('Message deleted')).toBeInTheDocument();
  });

  it('says so when the replied-to message is not available', () => {
    renderItem(
      message({ body: 'the answer', replyToEventId: '$gone' }),
      actions(),
    );
    expect(
      screen.getByText('Original message is unavailable'),
    ).toBeInTheDocument();
  });
});
