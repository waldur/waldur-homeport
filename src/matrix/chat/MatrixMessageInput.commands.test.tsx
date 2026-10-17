import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ComponentProps,
  FC,
  PropsWithChildren,
  ReactElement,
  createElement,
} from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  client: {
    sendTextMessage: vi.fn(),
    sendMessage: vi.fn(),
    getRoom: vi.fn(),
    sendTyping: vi.fn(() => Promise.resolve()),
  } as any,
  activeRoomId: '!room:s',
  commands: [] as ComposerCommand[],
  botCommandsLoaded: true,
  runClientCommand: vi.fn(),
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: h.activeRoomId,
    activeRoomUuid: 'uuid-1',
    connectionState: 'connected',
    userId: '@me:s',
  }),
}));
vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => new Map<string, string>(),
}));
vi.mock('./commands/useComposerCommands', () => ({
  useComposerCommands: () => ({
    commands: h.commands,
    botCommandsLoaded: h.botCommandsLoaded,
    runClientCommand: h.runClientCommand,
  }),
}));

import type { ComposerCommand } from './commands/composerCommands';
import { MatrixComposerDraftProvider } from './MatrixComposerDraftContext';
import {
  MatrixMessageActions,
  MatrixMessageActionsProvider,
} from './MatrixMessageActionsContext';
import { MatrixMessageInput } from './MatrixMessageInput';

const BOT_COMMANDS: ComposerCommand[] = [
  {
    name: 'help',
    description: 'List the commands',
    source: 'bot',
    available: true,
  },
  {
    name: 'status',
    description: 'Project status',
    source: 'bot',
    available: true,
  },
  {
    name: 'orders',
    description: 'Recent orders',
    source: 'bot',
    available: true,
  },
  {
    name: 'ticket',
    description: 'Draft a support ticket',
    args: '[description]',
    source: 'bot',
    available: true,
  },
  {
    name: 'ticket send',
    description: 'Send your draft',
    source: 'bot',
    available: false,
    reason: 'You have no open ticket draft in this room.',
  },
  {
    name: 'call',
    description: 'Start a call in this room',
    source: 'client',
    available: true,
  },
];

const wrapper: FC<PropsWithChildren> = ({ children }) =>
  createElement(MatrixComposerDraftProvider, null, children);

const composer = (
  props: Partial<ComponentProps<typeof MatrixMessageInput>> = {},
) => (
  <MatrixMessageInput
    uploadFile={vi.fn()}
    uploading={false}
    pendingFiles={[]}
    addFiles={vi.fn()}
    removePending={vi.fn()}
    setPending={vi.fn()}
    clearPending={vi.fn()}
    {...props}
  />
);

const getTextarea = () =>
  screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;

const renderInput = (
  props: Partial<ComponentProps<typeof MatrixMessageInput>> = {},
) => {
  render(composer(props), { wrapper });
  return getTextarea();
};

const optionNames = () =>
  screen.getAllByRole('option').map((o) => o.textContent);

const scrollIntoView = vi.fn();

beforeEach(() => {
  // jsdom lays nothing out, so it has no scrollIntoView.
  Element.prototype.scrollIntoView = scrollIntoView;
  scrollIntoView.mockClear();
  h.client.sendTextMessage.mockReset().mockResolvedValue(undefined);
  h.client.sendMessage.mockReset().mockResolvedValue(undefined);
  h.client.sendTyping.mockClear();
  h.activeRoomId = '!room:s';
  h.commands = BOT_COMMANDS;
  h.botCommandsLoaded = true;
  h.runClientCommand.mockReset();
});

describe('MatrixMessageInput command menu', () => {
  it('lists the bot’s commands after ! and filters them', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!');
    expect(screen.getByRole('listbox', { name: 'Commands' })).toBeVisible();
    // Neither unavailable commands nor Waldur's own /call are offered.
    expect(screen.getAllByRole('option')).toHaveLength(4);
    await user.type(textarea, 'ti');
    expect(optionNames()).toEqual([
      '!ticket [description]Draft a support ticket',
    ]);
  });

  it('shows the same commands in / form', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/st');
    expect(optionNames()).toEqual(['/statusProject status']);
  });

  it('moves with the arrow keys and inserts with Enter, without sending', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!');
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
    expect(textarea).toHaveAttribute('aria-activedescendant', options[2].id);
    await user.keyboard('{ArrowUp}{Enter}');
    expect(textarea.value).toBe('!status ');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
    // With the menu closed, Enter sends.
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith(
        '!room:s',
        '!status',
      ),
    );
  });

  it('scrolls the active command into view as the arrows move', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!');
    const options = screen.getAllByRole('option');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest' });
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(options[2]);
    // Up from the top wraps to the bottom, out of view in a long list.
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(options[3]);
  });

  it('gives the highlight to a moving pointer, not to one the list scrolls under', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!');
    const options = screen.getAllByRole('option');
    const pointAt = (option: HTMLElement, clientY: number) =>
      user.pointer({ target: option, coords: { clientX: 10, clientY } });
    // The first move only tells the list where the pointer is.
    await pointAt(options[1], 50);
    await pointAt(options[1], 60);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    // What Safari sends as the list scrolls: another row, the same spot.
    await pointAt(options[2], 60);
    expect(options[3]).toHaveAttribute('aria-selected', 'true');
    await pointAt(options[2], 70);
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('points the textbox at the menu only while it is shown', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    // It can always open one.
    expect(textarea).toHaveAttribute('aria-haspopup', 'listbox');
    expect(textarea).not.toHaveAttribute('aria-autocomplete');
    expect(textarea).not.toHaveAttribute('aria-controls');
    await user.type(textarea, '!');
    expect(textarea).toHaveAttribute('aria-autocomplete', 'list');
    expect(textarea).toHaveAttribute(
      'aria-controls',
      screen.getByRole('listbox').id,
    );
    await user.keyboard('{Escape}');
    expect(textarea).not.toHaveAttribute('aria-controls');
  });

  it('does not pick on Shift+Enter', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!he');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(textarea.value).toBe('!he\n');
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
  });

  it.each([
    ['isComposing', { isComposing: true }],
    ['keyCode 229', { keyCode: 229 }],
  ])(
    'neither picks nor sends while an IME composes (%s)',
    async (_name, composing) => {
      const user = userEvent.setup();
      const textarea = renderInput();
      // userEvent can't type a key as part of an IME composition.
      const composeKey = (key: string) =>
        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.keyDown(textarea, { key, ...composing });
      await user.type(textarea, '/st');
      composeKey('Enter');
      composeKey('Tab');
      expect(textarea.value).toBe('/st');
      expect(screen.getByRole('listbox')).toBeVisible();
      await user.keyboard('{Escape}');
      composeKey('Enter');
      expect(h.client.sendTextMessage).not.toHaveBeenCalled();
    },
  );

  it('inserts with Tab and with the mouse', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/ti');
    await user.keyboard('{Tab}');
    expect(textarea.value).toBe('/ticket ');
    await user.clear(textarea);
    await user.type(textarea, '!');
    await user.click(screen.getByRole('option', { name: /help/ }));
    expect(textarea.value).toBe('!help ');
  });

  it('closes on Escape and then sends with Enter', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!help');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith('!room:s', '!help'),
    );
  });

  it('sends a / command in the bot’s ! form', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/ticket backups are failing{Enter}');
    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith(
        '!room:s',
        '!ticket backups are failing',
      ),
    );
  });

  it('keeps an unknown / command in the composer with a hint', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/foo bar{Enter}');
    expect(
      screen.getByText(
        'Unknown command /foo. Type / for the list, or start with // to send it as text.',
      ),
    ).toBeInTheDocument();
    expect(textarea.value).toBe('/foo bar');
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
    // Editing the text clears the hint.
    await user.type(textarea, 'x');
    expect(
      screen.queryByText(
        'Unknown command /foo. Type / for the list, or start with // to send it as text.',
      ),
    ).toBeNull();
  });

  it('sends // as a literal leading slash', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '//etc is full{Enter}');
    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith(
        '!room:s',
        '/etc is full',
      ),
    );
  });

  it('sends ! text unchanged, known or not', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!nope at all{Enter}');
    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith(
        '!room:s',
        '!nope at all',
      ),
    );
  });

  it('marks client commands and runs them without sending', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/ca');
    expect(optionNames()).toEqual([
      '/callStart a call in this roomWaldur only',
    ]);
    await user.keyboard('{Enter}{Enter}');
    expect(h.runClientCommand).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'call' }),
    );
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
    expect(textarea.value).toBe('');
  });

  it('offers client commands only in / form, and sends a typed !call as text', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!ca');
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.type(textarea, 'll{Enter}');
    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith('!room:s', '!call'),
    );
    expect(h.runClientCommand).not.toHaveBeenCalled();
  });

  it('stops the typing notice when /call runs', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/call');
    expect(h.client.sendTyping).toHaveBeenLastCalledWith('!room:s', true, 5000);
    await user.keyboard('{Enter}');
    expect(h.runClientCommand).toHaveBeenCalled();
    expect(h.client.sendTyping).toHaveBeenLastCalledWith(
      '!room:s',
      false,
      undefined,
    );
  });

  it('runs no /call while a message is still being sent', async () => {
    const user = userEvent.setup();
    h.client.sendTextMessage.mockReturnValue(new Promise(() => {}));
    const textarea = renderInput();
    await user.type(textarea, 'hi{Enter}');
    await waitFor(() => expect(h.client.sendTextMessage).toHaveBeenCalled());
    await user.clear(textarea);
    await user.type(textarea, '/call{Enter}');
    expect(h.runClientCommand).not.toHaveBeenCalled();
    expect(textarea.value).toBe('/call');
  });

  it('keeps an unavailable / command in the composer with its reason', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/ticket send{Enter}');
    expect(
      screen.getByText(
        "/ticket send isn't available here: You have no open ticket draft in this room.",
      ),
    ).toBeInTheDocument();
    expect(textarea.value).toBe('/ticket send');
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
  });

  it.each([
    ['!status', '!status'],
    ['/Help', '!help'],
  ])(
    'sends %j at once on Enter, as it takes nothing more',
    async (typed, sent) => {
      const user = userEvent.setup();
      const textarea = renderInput();
      await user.type(textarea, typed);
      expect(screen.getByRole('listbox')).toBeVisible();
      await user.keyboard('{Enter}');
      await waitFor(() =>
        expect(h.client.sendTextMessage).toHaveBeenCalledWith('!room:s', sent),
      );
      expect(textarea.value).toBe('');
    },
  );

  it('runs an exact /call at once on Enter', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/call{Enter}');
    expect(h.runClientCommand).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'call' }),
    );
    expect(textarea.value).toBe('');
  });

  it('inserts an exact command that takes arguments, and Tab always inserts', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '/ticket{Enter}');
    expect(textarea.value).toBe('/ticket ');
    await user.clear(textarea);
    await user.type(textarea, '!status{Tab}');
    expect(textarea.value).toBe('!status ');
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
  });

  it('keeps the menu closed after a pick so Enter sends', async () => {
    const user = userEvent.setup();
    const textarea = renderInput();
    await user.type(textarea, '!tic');
    await user.keyboard('{Enter}');
    expect(textarea.value).toBe('!ticket ');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  // Loading, or failed: the backend always lists every command, so an empty
  // list means it isn't known yet.
  describe('while the bot’s commands are not loaded', () => {
    beforeEach(() => {
      h.commands = BOT_COMMANDS.filter((c) => c.source === 'client');
      h.botCommandsLoaded = false;
    });

    it('offers no bot command, but still /call', async () => {
      const user = userEvent.setup();
      const textarea = renderInput();
      await user.type(textarea, '!');
      expect(screen.queryByRole('listbox')).toBeNull();
      await user.clear(textarea);
      await user.type(textarea, '/');
      expect(optionNames()).toEqual([
        '/callStart a call in this roomWaldur only',
      ]);
    });

    it('sends a / command in ! form for the bot to answer', async () => {
      const user = userEvent.setup();
      const textarea = renderInput();
      await user.type(textarea, '/ticket x{Enter}');
      await waitFor(() =>
        expect(h.client.sendTextMessage).toHaveBeenCalledWith(
          '!room:s',
          '!ticket x',
        ),
      );
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('still runs /call in Waldur', async () => {
      const user = userEvent.setup();
      const textarea = renderInput();
      await user.type(textarea, '/call{Enter}');
      expect(h.runClientCommand).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'call' }),
      );
      expect(h.client.sendTextMessage).not.toHaveBeenCalled();
    });
  });

  describe('on a room switch', () => {
    const switchTo = (rerender: (ui: ReactElement) => void, roomId: string) => {
      h.activeRoomId = roomId;
      rerender(composer());
    };

    it('drops the hint, which was about the other room’s text', async () => {
      const user = userEvent.setup();
      const { rerender } = render(composer(), { wrapper });
      await user.type(getTextarea(), '/foo{Enter}');
      expect(screen.getByRole('alert')).toBeInTheDocument();
      switchTo(rerender, '!other:s');
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('opens the menu afresh for the room’s own draft', async () => {
      const user = userEvent.setup();
      const { rerender } = render(composer(), { wrapper });
      switchTo(rerender, '!other:s');
      await user.type(getTextarea(), '/s');
      switchTo(rerender, '!room:s');
      // Moved down, then closed with Escape.
      await user.type(getTextarea(), '!{ArrowDown}{ArrowDown}{Escape}');
      expect(screen.queryByRole('listbox')).toBeNull();
      switchTo(rerender, '!other:s');
      expect(getTextarea().value).toBe('/s');
      expect(screen.getAllByRole('option')[0]).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });

  it('sends a / command as a reply in ! form, keeping the reply', async () => {
    const user = userEvent.setup();
    const cancelReply = vi.fn();
    const actions = {
      replyTo: {
        eventId: '$draft',
        sender: '@bot:s',
        senderDisplayName: 'Bot',
        body: 'Ticket draft',
        timestamp: 1,
        type: 'm.notice',
      },
      pickedCommand: null,
      clearPickedCommand: vi.fn(),
      cancelReply,
      editLastOwnMessage: () => false,
    } as unknown as MatrixMessageActions;
    render(
      <MatrixMessageActionsProvider value={actions}>
        {composer()}
      </MatrixMessageActionsProvider>,
      { wrapper },
    );
    await user.type(getTextarea(), '/Ticket backups fail{Enter}');
    await waitFor(() =>
      expect(h.client.sendMessage).toHaveBeenCalledWith('!room:s', {
        msgtype: 'm.text',
        body: '!ticket backups fail',
        'm.mentions': { user_ids: ['@bot:s'] },
        'm.relates_to': { 'm.in_reply_to': { event_id: '$draft' } },
      }),
    );
    expect(cancelReply).toHaveBeenCalled();
  });

  describe('a command picked in the commands dialog', () => {
    const withPicked = (pickedCommand: string | null) => {
      const actions = {
        replyTo: null,
        pickedCommand,
        clearPickedCommand: vi.fn(),
        cancelReply: vi.fn(),
        editLastOwnMessage: () => false,
      } as unknown as MatrixMessageActions;
      return {
        actions,
        ui: (
          <MatrixMessageActionsProvider value={actions}>
            {composer()}
          </MatrixMessageActionsProvider>
        ),
      };
    };

    it('is inserted like one from the menu', async () => {
      const { actions, ui } = withPicked('ticket');
      render(ui, { wrapper });
      await waitFor(() => expect(getTextarea().value).toBe('/ticket '));
      expect(actions.clearPickedCommand).toHaveBeenCalled();
      // The menu stays closed, so Enter sends.
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('goes before the text already typed, which it is then about', async () => {
      const user = userEvent.setup();
      const { rerender } = render(withPicked(null).ui, { wrapper });
      await user.type(getTextarea(), 'VM is down');
      rerender(withPicked('ticket').ui);
      await waitFor(() =>
        expect(getTextarea().value).toBe('/ticket VM is down'),
      );
      await waitFor(() =>
        expect(getTextarea().selectionStart).toBe('/ticket '.length),
      );
    });

    it('replaces a command already typed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(withPicked(null).ui, { wrapper });
      await user.type(getTextarea(), '!status{Escape}');
      rerender(withPicked('ticket').ui);
      await waitFor(() => expect(getTextarea().value).toBe('/ticket '));
    });
  });
});
