import { Feature, ServerSupport } from 'matrix-js-sdk/lib/feature';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redactMessageWithEdits } from './redactMessage';

const ROOM = '!room:s';
const ME = '@me:s';

const rawEdit = (id: string, sender = ME, target = '$msg') => ({
  event_id: id,
  room_id: ROOM,
  sender,
  type: 'm.room.message',
  origin_server_ts: 2,
  content: {
    msgtype: 'm.text',
    body: '* new',
    'm.new_content': { msgtype: 'm.text', body: 'new' },
    'm.relates_to': { rel_type: 'm.replace', event_id: target },
  },
});

// The user's own edit still being sent, emitting its status changes the way
// matrix-js-sdk does.
const pendingEdit = (status: string) => {
  const listeners = new Set<(...args: any[]) => void>();
  const edit: any = {
    status,
    id: '~txn',
    getId: () => edit.id,
    getSender: () => ME,
    getWireContent: () => rawEdit('~txn').content,
    isState: () => false,
    isRedacted: () => false,
    on: (_name: string, fn: (...args: any[]) => void) => listeners.add(fn),
    off: (_name: string, fn: (...args: any[]) => void) => listeners.delete(fn),
    setStatus: (next: string | null, id?: string) => {
      edit.status = next;
      if (id) edit.id = id;
      listeners.forEach((fn) => fn(edit, next));
    },
  };
  return edit;
};

// A loaded edit, as the room timeline holds it.
const loadedEdit = (id: string) => ({
  getId: () => id,
  getSender: () => ME,
  getWireContent: () => rawEdit(id).content,
  isState: () => false,
  isRedacted: () => false,
  status: null,
});

const makeClient = (support?: ServerSupport, pending: any[] = []) => {
  const room = {
    getLiveTimeline: () => ({ getEvents: () => [loadedEdit('$loaded')] }),
    getPendingEvents: () => pending,
    currentState: {
      // Only the user's own events may be redacted here.
      maySendRedactionForEvent: vi.fn(
        (event: any, userId: string) => event.getSender() === userId,
      ),
    },
  };
  return {
    room,
    cancelPendingEvent: vi.fn(),
    canSupport: new Map(
      support === undefined ? [] : [[Feature.RelationBasedRedactions, support]],
    ),
    getRoom: () => room,
    redactEvent: vi.fn().mockResolvedValue({}),
    fetchRelations: vi.fn().mockResolvedValue({
      chunk: [
        rawEdit('$loaded'),
        rawEdit('$older'),
        rawEdit('$forged', '@mallory:s'),
      ],
    }),
  } as any;
};

describe('redactMessageWithEdits', () => {
  let client: any;

  beforeEach(() => {
    client = makeClient();
  });

  it('lets a homeserver with relation-based redactions delete the edits', async () => {
    client = makeClient(ServerSupport.Unstable);
    await expect(
      redactMessageWithEdits(client, ROOM, '$msg', ME),
    ).resolves.toEqual({ failed: 0, incomplete: false });
    expect(client.redactEvent).toHaveBeenCalledTimes(1);
    expect(client.redactEvent).toHaveBeenCalledWith(ROOM, '$msg', undefined, {
      with_rel_types: ['m.replace'],
    });
  });

  it('otherwise deletes each loaded and fetched edit the user may redact', async () => {
    client = makeClient(ServerSupport.Unsupported);
    await expect(
      redactMessageWithEdits(client, ROOM, '$msg', ME),
    ).resolves.toEqual({ failed: 0, incomplete: false });
    expect(client.redactEvent.mock.calls.map((c: any[]) => c[1])).toEqual([
      '$msg',
      '$loaded',
      '$older',
    ]);
  });

  it('treats a homeserver that has not said as one without support', async () => {
    await redactMessageWithEdits(client, ROOM, '$msg', ME);
    expect(client.redactEvent).toHaveBeenCalledWith(ROOM, '$msg');
    expect(client.redactEvent).toHaveBeenCalledWith(ROOM, '$older');
  });

  it('still deletes the loaded edits when the relations cannot be fetched', async () => {
    client.fetchRelations.mockRejectedValue(new Error('offline'));
    await expect(
      redactMessageWithEdits(client, ROOM, '$msg', ME),
    ).resolves.toEqual({ failed: 0, incomplete: true });
    expect(client.redactEvent.mock.calls.map((c: any[]) => c[1])).toEqual([
      '$msg',
      '$loaded',
    ]);
  });

  it('counts the edits that could not be deleted', async () => {
    client.redactEvent.mockImplementation((_room: string, id: string) =>
      id === '$older' ? Promise.reject(new Error('no')) : Promise.resolve({}),
    );
    await expect(
      redactMessageWithEdits(client, ROOM, '$msg', ME),
    ).resolves.toEqual({ failed: 1, incomplete: false });
  });

  it('fails without touching the edits when the message cannot be deleted', async () => {
    client.redactEvent.mockRejectedValue({ errcode: 'M_FORBIDDEN' });
    await expect(
      redactMessageWithEdits(client, ROOM, '$msg', ME),
    ).rejects.toEqual({ errcode: 'M_FORBIDDEN' });
    expect(client.redactEvent).toHaveBeenCalledTimes(1);
  });

  it('asks for large pages of relations', async () => {
    await redactMessageWithEdits(client, ROOM, '$msg', ME);
    expect(client.fetchRelations).toHaveBeenCalledWith(
      ROOM,
      '$msg',
      'm.replace',
      null,
      expect.objectContaining({ limit: 100 }),
    );
  });

  it('cancels an edit that has not left yet instead of redacting it', async () => {
    const edit = pendingEdit('queued');
    client = makeClient(undefined, [edit]);
    await redactMessageWithEdits(client, ROOM, '$msg', ME);
    expect(client.cancelPendingEvent).toHaveBeenCalledWith(edit);
    expect(client.redactEvent).not.toHaveBeenCalledWith(ROOM, '~txn');
  });

  it('waits for an edit being sent and redacts it once it lands', async () => {
    const edit = pendingEdit('sending');
    client = makeClient(undefined, [edit]);
    const deletion = redactMessageWithEdits(client, ROOM, '$msg', ME);
    await vi.waitFor(() =>
      expect(client.redactEvent).toHaveBeenCalledWith(ROOM, '$older'),
    );
    expect(client.redactEvent).not.toHaveBeenCalledWith(ROOM, '$sent');

    edit.setStatus('sent', '$sent');
    await expect(deletion).resolves.toEqual({ failed: 0, incomplete: false });
    expect(client.redactEvent).toHaveBeenLastCalledWith(ROOM, '$sent');
  });

  it('counts an edit that never finishes sending as not deleted', async () => {
    vi.useFakeTimers();
    try {
      client = makeClient(undefined, [pendingEdit('sending')]);
      const deletion = redactMessageWithEdits(client, ROOM, '$msg', ME);
      await vi.advanceTimersByTimeAsync(30_000);
      await expect(deletion).resolves.toEqual({ failed: 1, incomplete: false });
    } finally {
      vi.useRealTimers();
    }
  });
});
