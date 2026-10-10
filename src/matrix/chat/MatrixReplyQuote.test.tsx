import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MatrixReplyQuote } from './MatrixReplyQuote';

const ROOM = '!room:s';

const h = vi.hoisted(() => {
  const listeners = new Map<string, Set<(...args: any[]) => void>>();
  return {
    listeners,
    client: {
      fetchRoomEvent: vi.fn(),
      fetchRelations: vi.fn(),
      decryptEventIfNeeded: vi.fn(() => Promise.resolve()),
      getRoom: () => null,
      on: (name: string, fn: (...args: any[]) => void) => {
        if (!listeners.has(name)) listeners.set(name, new Set());
        listeners.get(name)!.add(fn);
      },
      removeListener: (name: string, fn: (...args: any[]) => void) => {
        listeners.get(name)?.delete(fn);
      },
      emit: (name: string, ...args: any[]) =>
        listeners.get(name)?.forEach((fn) => fn(...args)),
    } as any,
  };
});

vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: h.client, activeRoomId: '!room:s' }),
}));

const raw = (
  id: string,
  content: Record<string, any>,
  { sender = '@alice:s', ts = 1 } = {},
) => ({
  event_id: id,
  room_id: ROOM,
  sender,
  type: 'm.room.message',
  origin_server_ts: ts,
  content,
});

const rawEdit = (
  id: string,
  target: string,
  body: string,
  options?: { sender?: string; ts?: number },
) =>
  raw(
    id,
    {
      msgtype: 'm.text',
      body: `* ${body}`,
      'm.new_content': { msgtype: 'm.text', body },
      'm.relates_to': { rel_type: 'm.replace', event_id: target },
    },
    { ts: 2, ...options },
  );

const original = raw('$orig', { msgtype: 'm.text', body: 'the question' });

const serve = (
  events: Record<string, any>,
  relations: Record<string, any[]>,
) => {
  h.client.fetchRoomEvent.mockImplementation((_room: string, id: string) =>
    events[id] ? Promise.resolve(events[id]) : Promise.reject({}),
  );
  h.client.fetchRelations.mockImplementation((_room: string, id: string) =>
    Promise.resolve({ chunk: relations[id] ?? [] }),
  );
};

describe('MatrixReplyQuote of a message outside the loaded timeline', () => {
  beforeEach(() => {
    h.listeners.clear();
    vi.clearAllMocks();
  });

  it("shows the newest valid edit, not another sender's", async () => {
    serve(
      { $orig: original },
      {
        $orig: [
          rawEdit('$e1', '$orig', 'the better question'),
          rawEdit('$e2', '$orig', 'forged', { sender: '@mallory:s', ts: 3 }),
        ],
      },
    );
    render(<MatrixReplyQuote parentId="$orig" />);
    expect(await screen.findByText('the better question')).toBeInTheDocument();
    expect(screen.queryByText('forged')).not.toBeInTheDocument();
    expect(h.client.fetchRelations).toHaveBeenCalledWith(
      ROOM,
      '$orig',
      'm.replace',
      null,
      expect.objectContaining({ limit: 100 }),
    );
  });

  it('quotes the message an edit replaces when replying to the edit', async () => {
    const edit = rawEdit('$e1', '$orig', 'the better question');
    serve({ $orig: original, $e1: edit }, { $orig: [edit] });
    render(<MatrixReplyQuote parentId="$e1" />);
    expect(await screen.findByText('the better question')).toBeInTheDocument();
    expect(h.client.fetchRoomEvent).toHaveBeenCalledWith(ROOM, '$orig');
  });

  it('follows a new edit of the quoted message', async () => {
    serve({ $orig: original }, {});
    render(<MatrixReplyQuote parentId="$orig" />);
    expect(await screen.findByText('the question')).toBeInTheDocument();

    const edit = rawEdit('$e1', '$orig', 'edited later');
    serve({ $orig: original }, { $orig: [edit] });
    act(() => {
      h.client.emit('Room.timeline', {
        getRoomId: () => ROOM,
        getWireContent: () => edit.content,
        isState: () => false,
      });
    });
    expect(await screen.findByText('edited later')).toBeInTheDocument();
  });

  it('follows the deletion of the quoted message', async () => {
    serve({ $orig: original }, {});
    render(<MatrixReplyQuote parentId="$orig" />);
    expect(await screen.findByText('the question')).toBeInTheDocument();

    serve(
      {
        $orig: {
          ...original,
          content: {},
          unsigned: { redacted_because: { type: 'm.room.redaction' } },
        },
      },
      {},
    );
    act(() => {
      h.client.emit(
        'Room.redaction',
        { event: { redacts: '$orig' } },
        { roomId: ROOM },
      );
    });
    expect(await screen.findByText('Message deleted')).toBeInTheDocument();
  });

  it('says so when the message cannot be fetched', async () => {
    serve({}, {});
    render(<MatrixReplyQuote parentId="$gone" />);
    expect(
      await screen.findByText('Original message is unavailable'),
    ).toBeInTheDocument();
  });
});
