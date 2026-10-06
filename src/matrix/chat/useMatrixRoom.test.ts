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
