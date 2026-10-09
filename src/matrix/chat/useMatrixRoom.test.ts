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
