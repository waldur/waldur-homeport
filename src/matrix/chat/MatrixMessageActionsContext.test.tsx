import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { useMatrixMessageActionsValue } from './MatrixMessageActionsContext';
import { MatrixChatMessage } from './types';

const h = vi.hoisted(() => {
  const room = {
    findEventById: vi.fn(),
    currentState: { maySendRedactionForEvent: vi.fn() },
  };
  return {
    room,
    client: {
      getRoom: () => room,
      sendMessage: vi.fn(),
      redactEvent: vi.fn(),
    } as any,
  };
});

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    activeRoomId: '!room:s',
    userId: '@me:s',
  }),
}));
vi.mock('./useMentionCandidates', () => ({
  useMentionCandidates: () => [{ userId: '@bob:s', displayName: 'Bob' }],
}));

// Both are mocked globally (test/mocks).
const confirm = vi.mocked(useModal().confirm);
const showError = vi.mocked(useNotify().showError);

const message = (
  overrides: Partial<MatrixChatMessage> = {},
): MatrixChatMessage => ({
  eventId: '$mine',
  sender: '@me:s',
  senderDisplayName: 'Me',
  body: 'hello',
  timestamp: 1,
  type: 'm.text',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  h.room.findEventById.mockReturnValue(undefined);
  h.client.sendMessage.mockResolvedValue({ event_id: '$edit' });
  h.client.redactEvent.mockResolvedValue({});
  confirm.mockResolvedValue(undefined);
});

describe('useMatrixMessageActionsValue', () => {
  it('lets the user edit only their own text messages', () => {
    const { result } = renderHook(() => useMatrixMessageActionsValue([]));
    const { canEdit } = result.current;
    expect(canEdit(message())).toBe(true);
    expect(canEdit(message({ sender: '@bob:s' }))).toBe(false);
    expect(canEdit(message({ type: 'm.image', url: 'mxc://s/x' }))).toBe(false);
    expect(canEdit(message({ redacted: true }))).toBe(false);
  });

  it('lets the user delete what the power levels allow', () => {
    const { result } = renderHook(() => useMatrixMessageActionsValue([]));
    const mine = message();
    const theirs = message({ eventId: '$theirs', sender: '@bob:s' });
    const event = {};
    h.room.findEventById.mockReturnValue(event);

    h.room.currentState.maySendRedactionForEvent.mockReturnValue(true);
    expect(result.current.canDelete(mine)).toBe(true);
    expect(result.current.canDelete(theirs)).toBe(true);
    expect(h.room.currentState.maySendRedactionForEvent).toHaveBeenCalledWith(
      event,
      '@me:s',
    );

    // Redactions blocked: not even the user's own message.
    h.room.currentState.maySendRedactionForEvent.mockReturnValue(false);
    expect(result.current.canDelete(mine)).toBe(false);
    expect(result.current.canDelete(theirs)).toBe(false);
  });

  it('keeps mentioning the replied-to sender in an edited reply', async () => {
    h.room.findEventById.mockReturnValue({ getSender: () => '@alice:s' });
    const reply = message({
      replyToEventId: '$parent',
      mentionedUserIds: ['@alice:s'],
    });
    const { result } = renderHook(() => useMatrixMessageActionsValue([reply]));
    await act(() => result.current.saveEdit(reply, 'changed'));
    const content = h.client.sendMessage.mock.calls[0][1];
    expect(content['m.new_content']['m.mentions']).toEqual({
      user_ids: ['@alice:s'],
    });
    // Already notified by the reply itself.
    expect(content['m.mentions']).toEqual({ user_ids: [] });
  });

  it('sends an edit and closes the editor', async () => {
    const msg = message({ mentionedUserIds: [] });
    const { result } = renderHook(() => useMatrixMessageActionsValue([msg]));
    act(() => result.current.startEdit(msg));
    expect(result.current.editingEventId).toBe('$mine');

    await act(() => result.current.saveEdit(msg, 'hello @Bob'));

    expect(h.client.sendMessage).toHaveBeenCalledWith(
      '!room:s',
      expect.objectContaining({
        body: '* hello @Bob',
        'm.mentions': { user_ids: ['@bob:s'] },
        'm.new_content': expect.objectContaining({ body: 'hello @Bob' }),
        'm.relates_to': { rel_type: 'm.replace', event_id: '$mine' },
      }),
    );
    expect(result.current.editingEventId).toBeNull();
  });

  it('keeps the editor open when the edit fails', async () => {
    h.client.sendMessage.mockRejectedValue({ errcode: 'M_FORBIDDEN' });
    const msg = message();
    const { result } = renderHook(() => useMatrixMessageActionsValue([msg]));
    act(() => result.current.startEdit(msg));
    await act(() => result.current.saveEdit(msg, 'changed'));
    expect(showError).toHaveBeenCalled();
    expect(result.current.editingEventId).toBe('$mine');
  });

  it('sends nothing for an unchanged edit', async () => {
    const msg = message();
    const { result } = renderHook(() => useMatrixMessageActionsValue([msg]));
    act(() => result.current.startEdit(msg));
    await act(() => result.current.saveEdit(msg, ' hello '));
    expect(h.client.sendMessage).not.toHaveBeenCalled();
    expect(result.current.editingEventId).toBeNull();
  });

  it('deletes a message once confirmed', async () => {
    const { result } = renderHook(() => useMatrixMessageActionsValue([]));
    await act(() => result.current.deleteMessage(message()));
    expect(confirm).toHaveBeenCalled();
    expect(h.client.redactEvent).toHaveBeenCalledWith('!room:s', '$mine');
  });

  it('warns when the earlier versions could not all be found', async () => {
    h.client.fetchRelations = vi.fn().mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useMatrixMessageActionsValue([]));
    await act(() => result.current.deleteMessage(message()));
    expect(h.client.redactEvent).toHaveBeenCalledWith('!room:s', '$mine');
    expect(showError).toHaveBeenCalledWith(
      expect.stringContaining('Some may remain on the server.'),
    );
  });

  it('keeps the message when deletion is not confirmed', async () => {
    confirm.mockRejectedValue(undefined);
    const { result } = renderHook(() => useMatrixMessageActionsValue([]));
    await act(() => result.current.deleteMessage(message()));
    expect(h.client.redactEvent).not.toHaveBeenCalled();
  });

  it('edits the newest own text message on request', () => {
    const messages = [
      message({ eventId: '$older' }),
      message({ eventId: '$theirs', sender: '@bob:s' }),
      message({ eventId: '$file', type: 'm.file', url: 'mxc://s/f' }),
    ];
    const { result } = renderHook(() => useMatrixMessageActionsValue(messages));
    act(() => {
      expect(result.current.editLastOwnMessage()).toBe(true);
    });
    expect(result.current.editingEventId).toBe('$older');
  });

  it('drops a reply to a message deleted meanwhile', () => {
    const parent = message({ eventId: '$parent', sender: '@bob:s' });
    const { result, rerender } = renderHook(
      ({ messages }) => useMatrixMessageActionsValue(messages),
      { initialProps: { messages: [parent] } },
    );
    act(() => result.current.startReply(parent));
    expect(result.current.replyTo).toBe(parent);
    rerender({ messages: [{ ...parent, redacted: true }] });
    expect(result.current.replyTo).toBeNull();
  });
});
