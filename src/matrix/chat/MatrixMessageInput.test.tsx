import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, FC, PropsWithChildren, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  client: {
    sendTextMessage: vi.fn(),
    sendMessage: vi.fn(),
    getRoom: vi.fn(),
    sendTyping: vi.fn(() => Promise.resolve()),
  } as any,
  connectionState: 'connected',
  activeRoomUuid: 'uuid-1',
  requestedRoomUuid: 'uuid-1' as string | null,
  showRoomHere: vi.fn(),
}));

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: '!room:s',
    activeRoomUuid: h.activeRoomUuid,
    requestedRoomUuid: h.requestedRoomUuid,
    connectionState: h.connectionState,
    userId: '@me:s',
    showRoomHere: h.showRoomHere,
  }),
}));
vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => new Map<string, string>(),
}));
// The command menu has its own tests (MatrixMessageInput.commands.test.tsx).
vi.mock('./commands/useComposerCommands', () => ({
  useComposerCommands: () => ({ commands: [], runClientCommand: vi.fn() }),
}));

import { MatrixComposerDraftProvider } from './MatrixComposerDraftContext';
import {
  MatrixMessageActions,
  MatrixMessageActionsProvider,
} from './MatrixMessageActionsContext';
import { MatrixMessageInput } from './MatrixMessageInput';

const wrapper: FC<PropsWithChildren> = ({ children }) =>
  createElement(MatrixComposerDraftProvider, null, children);

beforeEach(() => {
  h.client.sendTextMessage.mockReset().mockResolvedValue(undefined);
  h.client.sendMessage.mockReset().mockResolvedValue(undefined);
  h.client.getRoom.mockReset().mockReturnValue(null);
  h.connectionState = 'connected';
  h.activeRoomUuid = 'uuid-1';
  h.requestedRoomUuid = 'uuid-1';
  h.showRoomHere.mockReset();
});

const composer = (
  roomUuid: string,
  props: Partial<ComponentProps<typeof MatrixMessageInput>> = {},
) => (
  <MatrixMessageInput
    roomUuid={roomUuid}
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

const renderComposer = (
  roomUuid: string,
  props: Partial<ComponentProps<typeof MatrixMessageInput>> = {},
) => render(composer(roomUuid, props), { wrapper });

const pastedFile = (file: File) =>
  ({
    files: [file],
    items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
    getData: () => '',
    types: ['Files'],
  }) as unknown as DataTransfer;

describe('MatrixMessageInput room', () => {
  // The header names the room on screen and messages go to the active one, so
  // a mismatch would post to a room the user is not looking at. The draft
  // belongs to the active room too.
  it('writes and sends nothing while another room is active', async () => {
    const user = userEvent.setup();
    const { rerender } = renderComposer('another-room');
    const textarea = screen.getByRole('textbox', { name: 'Message' });

    await user.type(textarea, 'hello{Enter}');
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    rerender(composer('uuid-1'));

    expect(textarea).toHaveValue('');
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
  });

  it('says Connecting only while the client connects', () => {
    h.connectionState = 'connecting';
    renderComposer('uuid-1');

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('placeholder', 'Connecting...');
  });

  it("does not show the open room's draft", async () => {
    const user = userEvent.setup();
    const { rerender } = renderComposer('uuid-1');
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'draft');

    rerender(composer('another-room'));

    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue('');
  });

  it("does not show the open room's staged files", () => {
    const file = new File(['a'], 'only-in-a.pdf', { type: 'application/pdf' });

    renderComposer('another-room', { pendingFiles: [file] });

    expect(screen.queryByText('only-in-a.pdf')).not.toBeInTheDocument();
  });

  it('asks for nothing more while its own room opens', async () => {
    const user = userEvent.setup();
    h.requestedRoomUuid = 'another-room';
    renderComposer('another-room');

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await user.click(textarea);
    await user.keyboard('h');

    expect(h.showRoomHere).not.toHaveBeenCalled();
    expect(textarea).toHaveAttribute('placeholder', 'Connecting...');
  });

  describe('while another view has the room', () => {
    it('offers to open its room here', () => {
      renderComposer('another-room');

      const textarea = screen.getByRole('textbox', { name: 'Message' });
      expect(textarea).toBeEnabled();
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Click or type to open this conversation here',
      );
    });

    it('brings its room here on a click', async () => {
      const user = userEvent.setup();
      renderComposer('another-room');

      await user.click(screen.getByRole('textbox', { name: 'Message' }));

      expect(h.showRoomHere).toHaveBeenCalledWith('another-room');
    });

    it('brings its room here once typing starts', async () => {
      const user = userEvent.setup();
      renderComposer('another-room');
      act(() => screen.getByRole('textbox', { name: 'Message' }).focus());

      await user.keyboard('h');

      expect(h.showRoomHere).toHaveBeenCalledWith('another-room');
    });

    // Many layouts type @ with Option (macOS) or AltGr (Ctrl+Alt on Windows).
    it.each([
      ['Option', '{Alt>}@{/Alt}'],
      ['AltGr', '{Control>}{Alt>}@{/Alt}{/Control}'],
    ])(
      'brings its room here for a character typed with %s',
      async (_, keys) => {
        const user = userEvent.setup();
        renderComposer('another-room');
        act(() => screen.getByRole('textbox', { name: 'Message' }).focus());

        await user.keyboard(keys);

        expect(h.showRoomHere).toHaveBeenCalledWith('another-room');
      },
    );

    it('stays put on shortcuts', async () => {
      const user = userEvent.setup();
      renderComposer('another-room');
      act(() => screen.getByRole('textbox', { name: 'Message' }).focus());

      await user.keyboard('{Control>}c{/Control}{Meta>}c{/Meta}');

      expect(h.showRoomHere).not.toHaveBeenCalled();
    });

    // Tab, a screen reader or a restored focus only pass through.
    it('stays put on focus and on keys that move on', async () => {
      const user = userEvent.setup();
      renderComposer('another-room');
      act(() => screen.getByRole('textbox', { name: 'Message' }).focus());

      await user.keyboard('{ArrowDown}{Escape}{Shift}{Tab}');

      expect(h.showRoomHere).not.toHaveBeenCalled();
    });

    it('brings its room here on a paste, without staging the file', async () => {
      const user = userEvent.setup();
      const addFiles = vi.fn();
      renderComposer('another-room', { addFiles });
      act(() => screen.getByRole('textbox', { name: 'Message' }).focus());

      await user.paste(
        pastedFile(new File(['x'], 'shot.png', { type: 'image/png' })),
      );

      expect(h.showRoomHere).toHaveBeenCalledWith('another-room');
      expect(addFiles).not.toHaveBeenCalled();
    });

    it('stages no file picked for it', async () => {
      const user = userEvent.setup();
      const addFiles = vi.fn();
      const { container } = renderComposer('another-room', { addFiles });

      await user.upload(
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        container.querySelector<HTMLInputElement>('input[type="file"]')!,
        new File(['x'], 'a.png', { type: 'image/png' }),
      );

      expect(addFiles).not.toHaveBeenCalled();
    });

    it('can be clicked back after the room left while it had focus', async () => {
      const user = userEvent.setup();
      const { rerender } = renderComposer('uuid-1');
      const textarea = screen.getByRole('textbox', { name: 'Message' });
      await user.click(textarea);

      h.activeRoomUuid = 'page-room';
      h.requestedRoomUuid = 'page-room';
      rerender(composer('uuid-1'));
      await user.click(textarea);

      expect(h.showRoomHere).toHaveBeenCalledWith('uuid-1');
    });
  });
});

describe('MatrixMessageInput partial upload failure', () => {
  it('keeps the failed file staged and does not send the text', async () => {
    const user = userEvent.setup();
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const uploadFile = vi
      .fn()
      .mockImplementation((f: File) => Promise.resolve(f.name !== 'b.png'));
    const setPending = vi.fn();
    const clearPending = vi.fn();

    render(
      <MatrixMessageInput
        roomUuid="uuid-1"
        uploadFile={uploadFile}
        uploading={false}
        pendingFiles={[fileA, fileB]}
        addFiles={vi.fn()}
        removePending={vi.fn()}
        setPending={setPending}
        clearPending={clearPending}
      />,
      { wrapper },
    );

    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await user.type(textarea, 'caption');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(setPending).toHaveBeenCalledWith([fileB]));
    expect(uploadFile).toHaveBeenCalledTimes(2);
    expect(clearPending).not.toHaveBeenCalled();
    expect(h.client.sendTextMessage).not.toHaveBeenCalled(); // text preserved
    expect((textarea as HTMLTextAreaElement).value).toBe('caption');
  });

  it('clears and sends the text when all uploads succeed', async () => {
    const user = userEvent.setup();
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const uploadFile = vi.fn().mockResolvedValue(true);
    const setPending = vi.fn();
    const clearPending = vi.fn();

    render(
      <MatrixMessageInput
        roomUuid="uuid-1"
        uploadFile={uploadFile}
        uploading={false}
        pendingFiles={[fileA]}
        addFiles={vi.fn()}
        removePending={vi.fn()}
        setPending={setPending}
        clearPending={clearPending}
      />,
      { wrapper },
    );
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await user.type(textarea, 'hi');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(h.client.sendTextMessage).toHaveBeenCalledWith('!room:s', 'hi'),
    );
    expect(clearPending).toHaveBeenCalledTimes(1);
  });
});

describe('PendingAttachments object-URL lifecycle', () => {
  it('creates one URL per image and reuses it across re-renders', () => {
    const createSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => 'blob:mock');
    const revokeSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);

    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const baseProps = {
      roomUuid: 'uuid-1',
      uploadFile: vi.fn(),
      uploading: false,
      addFiles: vi.fn(),
      removePending: vi.fn(),
      setPending: vi.fn(),
      clearPending: vi.fn(),
    };

    const { rerender } = render(
      <MatrixMessageInput {...baseProps} pendingFiles={[fileA]} />,
      { wrapper },
    );
    expect(createSpy).toHaveBeenCalledTimes(1);

    rerender(
      <MatrixMessageInput {...baseProps} pendingFiles={[fileA, fileB]} />,
    );
    expect(createSpy).toHaveBeenCalledTimes(2); // only B, not A again

    rerender(<MatrixMessageInput {...baseProps} pendingFiles={[fileB]} />);
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock'); // A revoked on leave

    createSpy.mockRestore();
    revokeSpy.mockRestore();
  });
});

describe('MatrixMessageInput replies', () => {
  const parent = {
    eventId: '$parent',
    sender: '@alice:s',
    senderDisplayName: 'Alice',
    body: 'the question',
    timestamp: 1,
    type: 'm.text',
  };
  const actions = (
    overrides: Partial<MatrixMessageActions> = {},
  ): MatrixMessageActions => ({
    replyTo: parent,
    startReply: vi.fn(),
    cancelReply: vi.fn(),
    editingEventId: null,
    startEdit: vi.fn(),
    cancelEdit: vi.fn(),
    editLastOwnMessage: vi.fn(() => true),
    saveEdit: vi.fn(),
    deleteMessage: vi.fn(),
    canEdit: () => true,
    canDelete: () => true,
    pickedCommand: null,
    pickCommand: vi.fn(),
    clearPickedCommand: vi.fn(),
    ...overrides,
  });
  const renderInput = (
    value: MatrixMessageActions,
    { uploadFile = vi.fn(), pendingFiles = [] as File[] } = {},
  ) =>
    render(
      <MatrixMessageActionsProvider value={value}>
        <MatrixMessageInput
          roomUuid="uuid-1"
          uploadFile={uploadFile}
          uploading={false}
          pendingFiles={pendingFiles}
          addFiles={vi.fn()}
          removePending={vi.fn()}
          setPending={vi.fn()}
          clearPending={vi.fn()}
        />
      </MatrixMessageActionsProvider>,
      { wrapper },
    );

  it('sends the text as a reply to the quoted message', async () => {
    const user = userEvent.setup();
    const value = actions();
    renderInput(value);

    expect(screen.getByText('Replying to Alice')).toBeInTheDocument();
    expect(screen.getByText('the question')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(textarea).toHaveFocus();
    await user.type(textarea, 'the answer{Enter}');

    await waitFor(() =>
      expect(h.client.sendMessage).toHaveBeenCalledWith('!room:s', {
        msgtype: 'm.text',
        body: 'the answer',
        'm.mentions': { user_ids: ['@alice:s'] },
        'm.relates_to': { 'm.in_reply_to': { event_id: '$parent' } },
      }),
    );
    expect(value.cancelReply).toHaveBeenCalled();
    expect(h.client.sendTextMessage).not.toHaveBeenCalled();
  });

  it('sends files without text as a reply through the first file', async () => {
    const user = userEvent.setup();
    const value = actions();
    const uploadFile = vi.fn().mockResolvedValue(true);
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];
    renderInput(value, { uploadFile, pendingFiles: files });
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(2));
    expect(uploadFile).toHaveBeenNthCalledWith(1, files[0], undefined, {
      'm.mentions': { user_ids: ['@alice:s'] },
      'm.relates_to': { 'm.in_reply_to': { event_id: '$parent' } },
    });
    expect(uploadFile).toHaveBeenNthCalledWith(
      2,
      files[1],
      undefined,
      undefined,
    );
    expect(value.cancelReply).toHaveBeenCalled();
  });

  it('cancels the reply with Escape', async () => {
    const user = userEvent.setup();
    const value = actions();
    renderInput(value);
    await user.type(
      screen.getByRole('textbox', { name: 'Message' }),
      '{Escape}',
    );
    expect(value.cancelReply).toHaveBeenCalled();
  });

  it('drops a command picked while another room is active', async () => {
    const user = userEvent.setup();
    const picked = actions({ replyTo: null, pickedCommand: 'ticket' });
    const idle = actions({ replyTo: null });
    const inRoom = (roomUuid: string, value: MatrixMessageActions) => (
      <MatrixMessageActionsProvider value={value}>
        {composer(roomUuid)}
      </MatrixMessageActionsProvider>
    );
    const { rerender } = render(inRoom('uuid-1', idle), { wrapper });
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'half');

    rerender(inRoom('another-room', picked));
    rerender(inRoom('uuid-1', idle));

    expect(picked.clearPickedCommand).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveValue(
      'half',
    );
  });

  it("leaves the open room's messages alone while another room is active", async () => {
    const user = userEvent.setup();
    const value = actions({ replyTo: null });
    render(
      <MatrixMessageActionsProvider value={value}>
        <MatrixMessageInput
          roomUuid="another-room"
          uploadFile={vi.fn()}
          uploading={false}
          pendingFiles={[]}
          addFiles={vi.fn()}
          removePending={vi.fn()}
          setPending={vi.fn()}
          clearPending={vi.fn()}
        />
      </MatrixMessageActionsProvider>,
      { wrapper },
    );

    await user.type(
      screen.getByRole('textbox', { name: 'Message' }),
      '{ArrowUp}',
    );

    expect(value.editLastOwnMessage).not.toHaveBeenCalled();
  });

  it('edits the last own message with Up in an empty composer', async () => {
    const user = userEvent.setup();
    const value = actions({ replyTo: null });
    renderInput(value);
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    await user.type(textarea, 'x{ArrowUp}');
    expect(value.editLastOwnMessage).not.toHaveBeenCalled();
    await user.clear(textarea);
    await user.type(textarea, '{ArrowUp}');
    expect(value.editLastOwnMessage).toHaveBeenCalled();
  });
});

describe('MatrixMessageInput voice message', () => {
  const renderRecording = (roomUuid: string) => {
    const onSendVoice = vi.fn();
    render(
      <MatrixMessageInput
        roomUuid={roomUuid}
        uploadFile={vi.fn()}
        uploading={false}
        pendingFiles={[]}
        addFiles={vi.fn()}
        removePending={vi.fn()}
        setPending={vi.fn()}
        clearPending={vi.fn()}
        recording
        onSendVoice={onSendVoice}
      />,
      { wrapper },
    );
    return screen.getByTitle('Send voice message');
  };

  it('can be sent in the active room', () => {
    expect(renderRecording('uuid-1')).toBeEnabled();
  });

  it('cannot be sent while another room is the active one', () => {
    expect(renderRecording('uuid-2')).toBeDisabled();
  });
});

describe('MatrixMessageInput mention list', () => {
  it('scrolls the active member into view as the arrows move', async () => {
    const scrollIntoView = vi.fn();
    // jsdom lays nothing out, so it has no scrollIntoView.
    Element.prototype.scrollIntoView = scrollIntoView;
    h.client.getRoom.mockReturnValue({
      getJoinedMembers: () =>
        ['alice', 'bob', 'carol'].map((name) => ({
          userId: `@${name}:s`,
          name,
        })),
    });
    const user = userEvent.setup();
    render(
      <MatrixMessageInput
        roomUuid="uuid-1"
        uploadFile={vi.fn()}
        uploading={false}
        pendingFiles={[]}
        addFiles={vi.fn()}
        removePending={vi.fn()}
        setPending={vi.fn()}
        clearPending={vi.fn()}
      />,
      { wrapper },
    );
    await user.type(screen.getByRole('textbox', { name: 'Message' }), '@');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest' });
    expect(scrollIntoView.mock.contexts.at(-1)).toHaveTextContent('carol');
  });
});
