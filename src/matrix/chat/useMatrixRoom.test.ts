import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMatrixRoom } from './useMatrixRoom';

const ROOM_ID = '!room:server';
const ME = '@me:server';

const { client, room, timeline } = vi.hoisted(() => {
  const listeners = new Map<string, Set<(...args: any[]) => void>>();
  const timeline: any[] = [];
  const room = {
    roomId: '!room:server',
    getLiveTimeline: () => ({ getEvents: () => timeline }),
    findEventById: (id: string) => timeline.find((e) => e.getId() === id),
    getMember: () => null,
  };
  const client = {
    getRoom: () => room,
    scrollback: async () => {},
    getUserId: () => '@me:server',
    on: (name: string, fn: (...args: any[]) => void) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(fn);
    },
    removeListener: (name: string, fn: (...args: any[]) => void) => {
      listeners.get(name)?.delete(fn);
    },
    emit: (name: string, ...args: any[]) => {
      listeners.get(name)?.forEach((fn) => fn(...args));
    },
  };
  return { client, room, timeline };
});

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client,
    activeRoomId: ROOM_ID,
    activeRoomUuid: 'room-uuid',
    connectionState: 'connected',
  }),
}));

vi.mock('./useRoomMemberNames', () => ({
  useRoomMemberNames: () => new Map(),
}));

function messageEvent(eventId: string) {
  return {
    getType: () => 'm.room.message',
    getId: () => eventId,
    getTxnId: () => undefined,
    getSender: () => '@other:server',
    getTs: () => 0,
    getContent: () => ({ msgtype: 'm.text', body: 'hey' }),
    isRedacted: () => false,
  };
}

// Mirrors matrix-js-sdk: once a reaction is redacted (locally or by the
// server), getContent() returns {} — m.relates_to is gone.
function reactionEvent(eventId: string, target: string, key: string) {
  let redacted = false;
  return {
    getType: () => 'm.reaction',
    getId: () => eventId,
    getSender: () => ME,
    getContent: () =>
      redacted
        ? {}
        : {
            'm.relates_to': {
              rel_type: 'm.annotation',
              event_id: target,
              key,
            },
          },
    isRedacted: () => redacted,
    setRedacted: (value: boolean) => {
      redacted = value;
    },
  };
}

const redactionOf = (eventId: string) => ({ event: { redacts: eventId } });

describe('useMatrixRoom reactions', () => {
  beforeEach(() => {
    timeline.length = 0;
  });

  it('drops a removed reaction from its message', async () => {
    const reaction = reactionEvent('r1', 'msg-1', '👍');
    timeline.push(messageEvent('msg-1'), reaction);
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() =>
      expect(result.current.messages[0]?.reactions).toHaveLength(1),
    );

    act(() => {
      reaction.setRedacted(true);
      client.emit('Room.redaction', redactionOf('r1'), room);
    });

    expect(result.current.messages[0].reactions).toEqual([]);
  });

  it('drops a removed reaction that arrived after the room loaded', async () => {
    timeline.push(messageEvent('msg-1'));
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    const reaction = reactionEvent('r1', 'msg-1', '👍');
    act(() => {
      timeline.push(reaction);
      client.emit('Room.timeline', reaction, room);
    });
    expect(result.current.messages[0].reactions).toHaveLength(1);

    act(() => {
      reaction.setRedacted(true);
      client.emit('Room.redaction', redactionOf('r1'), room);
    });

    expect(result.current.messages[0].reactions).toEqual([]);
  });

  it('restores a reaction whose removal failed', async () => {
    const reaction = reactionEvent('r1', 'msg-1', '👍');
    timeline.push(messageEvent('msg-1'), reaction);
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() =>
      expect(result.current.messages[0]?.reactions).toHaveLength(1),
    );

    act(() => {
      reaction.setRedacted(true);
      client.emit('Room.redaction', redactionOf('r1'), room);
    });
    act(() => {
      reaction.setRedacted(false);
      client.emit('Room.redactionCancelled', redactionOf('r1'), room);
    });

    expect(result.current.messages[0].reactions).toEqual([
      { key: '👍', count: 1, reactedByMe: true, myEventId: 'r1' },
    ]);
  });
});

// Mirrors matrix-js-sdk: an event is m.room.encrypted until decryption is
// attempted; a failed attempt reports it as an m.bad.encrypted m.room.message.
function encryptedEvent(eventId: string, ts: number) {
  let state: 'pending' | 'failed' | 'decrypted' = 'pending';
  return {
    getType: () =>
      state === 'pending' ? 'm.room.encrypted' : 'm.room.message',
    getId: () => eventId,
    getRoomId: () => ROOM_ID,
    getTxnId: () => undefined,
    getSender: () => '@other:server',
    getTs: () => ts,
    getContent: () =>
      state === 'failed'
        ? { msgtype: 'm.bad.encrypted', body: '** Unable to decrypt: x **' }
        : state === 'decrypted'
          ? { msgtype: 'm.text', body: 'secret' }
          : {},
    isDecryptionFailure: () => state === 'failed',
    isEncrypted: () => true,
    isRedacted: () => false,
    setState: (next: typeof state) => {
      state = next;
    },
  };
}

const timedMessage = (eventId: string, ts: number) => ({
  ...messageEvent(eventId),
  getTs: () => ts,
});

describe('useMatrixRoom decryption', () => {
  beforeEach(() => {
    timeline.length = 0;
  });

  it('keeps a decrypted message in its timeline position', async () => {
    const encrypted = encryptedEvent('enc-2', 2);
    timeline.push(
      timedMessage('msg-1', 1),
      encrypted,
      timedMessage('msg-3', 3),
    );
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() => expect(result.current.messages).toHaveLength(2));

    act(() => {
      encrypted.setState('decrypted');
      client.emit('Event.decrypted', encrypted);
    });

    expect(result.current.messages.map((m) => m.eventId)).toEqual([
      'msg-1',
      'enc-2',
      'msg-3',
    ]);
    expect(result.current.messages[1].body).toBe('secret');
  });

  it('updates a failed decryption in place once it succeeds', async () => {
    const encrypted = encryptedEvent('enc-2', 2);
    encrypted.setState('failed');
    timeline.push(
      timedMessage('msg-1', 1),
      encrypted,
      timedMessage('msg-3', 3),
    );
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() => expect(result.current.messages).toHaveLength(3));
    expect(result.current.messages[1].body).toBe(
      'Unable to decrypt this message.',
    );

    act(() => {
      encrypted.setState('decrypted');
      client.emit('Event.decrypted', encrypted);
    });

    expect(result.current.messages.map((m) => m.eventId)).toEqual([
      'msg-1',
      'enc-2',
      'msg-3',
    ]);
    expect(result.current.messages[1].body).toBe('secret');
  });
});

// Mirrors matrix-js-sdk: redaction strips the content, m.relates_to included.
function editEvent(
  eventId: string,
  target: string,
  body: string,
  { sender = '@other:server', ts = 5, encrypted = false } = {},
) {
  let redacted = false;
  let decrypted = !encrypted;
  const content = () =>
    redacted
      ? {}
      : {
          msgtype: 'm.text',
          body: `* ${body}`,
          'm.new_content': { msgtype: 'm.text', body },
          'm.relates_to': { rel_type: 'm.replace', event_id: target },
        };
  return {
    getType: () => (decrypted ? 'm.room.message' : 'm.room.encrypted'),
    getId: () => eventId,
    getRoomId: () => ROOM_ID,
    getTxnId: () => undefined,
    getSender: () => sender,
    getTs: () => ts,
    getContent: () => (decrypted ? content() : {}),
    // The relation stays in clear on an encrypted event.
    getWireContent: () =>
      redacted
        ? {}
        : decrypted
          ? content()
          : { 'm.relates_to': { rel_type: 'm.replace', event_id: target } },
    isRedacted: () => redacted,
    isDecryptionFailure: () => false,
    setRedacted: (value: boolean) => {
      redacted = value;
    },
    setDecrypted: () => {
      decrypted = true;
    },
  };
}

describe('useMatrixRoom edits and deletions', () => {
  beforeEach(() => {
    timeline.length = 0;
  });

  it('applies a live edit to its message without a row of its own', async () => {
    timeline.push(messageEvent('msg-1'));
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    const edit = editEvent('edit-1', 'msg-1', 'edited');
    act(() => {
      timeline.push(edit);
      client.emit('Room.timeline', edit, room);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual(
      expect.objectContaining({ body: 'edited', edited: true }),
    );
  });

  it("ignores another member's edit of the message", async () => {
    timeline.push(messageEvent('msg-1'));
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    const forged = editEvent('edit-1', 'msg-1', 'forged', {
      sender: '@mallory:server',
    });
    act(() => {
      timeline.push(forged);
      client.emit('Room.timeline', forged, room);
    });

    expect(result.current.messages[0].body).toBe('hey');
    expect(result.current.messages[0].edited).toBeUndefined();
  });

  it('applies an encrypted edit once it is decrypted', async () => {
    timeline.push(messageEvent('msg-1'));
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    const edit = editEvent('edit-1', 'msg-1', 'secret edit', {
      encrypted: true,
    });
    act(() => {
      timeline.push(edit);
      client.emit('Room.timeline', edit, room);
    });
    expect(result.current.messages[0].body).toBe('hey');

    act(() => {
      edit.setDecrypted();
      client.emit('Event.decrypted', edit);
    });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].body).toBe('secret edit');
  });

  it('restores the previous text when the edit is deleted', async () => {
    const first = editEvent('edit-1', 'msg-1', 'first', { ts: 5 });
    const second = editEvent('edit-2', 'msg-1', 'second', { ts: 6 });
    timeline.push(messageEvent('msg-1'), first, second);
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() =>
      expect(result.current.messages[0]?.body).toBe('second'),
    );

    act(() => {
      second.setRedacted(true);
      client.emit('Room.redaction', redactionOf('edit-2'), room);
    });
    expect(result.current.messages[0].body).toBe('first');

    // Reloaded history doesn't show the deleted edit as a deleted message.
    await act(() => result.current.loadOlderMessages());
    expect(result.current.messages.map((m) => m.eventId)).toEqual(['msg-1']);
  });

  it('turns a deleted message into a placeholder without reactions', async () => {
    let redacted = false;
    const message = {
      ...messageEvent('msg-1'),
      getContent: () => (redacted ? {} : { msgtype: 'm.text', body: 'oops' }),
      isRedacted: () => redacted,
    };
    timeline.push(message, reactionEvent('r1', 'msg-1', '👍'));
    const { result } = renderHook(() => useMatrixRoom());
    await waitFor(() =>
      expect(result.current.messages[0]?.reactions).toHaveLength(1),
    );

    act(() => {
      redacted = true;
      client.emit('Room.redaction', redactionOf('msg-1'), room);
    });

    expect(result.current.messages[0]).toEqual(
      expect.objectContaining({ eventId: 'msg-1', redacted: true, body: '' }),
    );
    expect(result.current.messages[0].reactions).toBeUndefined();
  });
});
