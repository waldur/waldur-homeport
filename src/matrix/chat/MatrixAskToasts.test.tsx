import { EventEmitter } from 'events';

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dismiss, show, toastStore } from 'waldur-notifications';

import { openSupportDrawer } from '@/support/openSupportDrawer';

import {
  ASK_DELAY_MS,
  ASK_MAX_EVENT_AGE_MS,
  ASK_TOAST_DURATION_MS,
  askToastId,
  WELCOME_SUMMARY_TOAST_ID,
} from './askEvents';
import { MatrixAskToasts } from './MatrixAskToasts';

const ME = '@me:x';
const BOT = '@assistant:x';

const h = vi.hoisted(() => ({
  client: null as any,
  connectionState: 'connected',
  userId: '',
  openDrawer: () => undefined,
  rooms: [] as any[],
}));

const makeWaldurRoom = (scope_name = 'Project X') => ({
  uuid: 'room-uuid',
  room_id: '!r:x',
  scope_name,
  room_name: 'Project X chat',
  bot_user_id: BOT,
});

// Spies over the real store: welcome toasts go by whether a toast is open.
vi.mock('waldur-notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('waldur-notifications')>();
  return {
    ...actual,
    show: vi.fn(actual.show),
    dismiss: vi.fn(actual.dismiss),
  };
});
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({
    client: h.client,
    connectionState: h.connectionState,
    userId: h.userId,
  }),
}));
vi.mock('./useMemberMatrixRooms', () => ({
  useMemberMatrixRooms: () => ({ data: h.rooms }),
}));
vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: h.openDrawer }),
}));
vi.mock('@/support/openSupportDrawer', () => ({
  openSupportDrawer: vi.fn(),
}));

const makeRoom = (roomId = '!r:x') => {
  const events: any[] = [];
  return {
    roomId,
    // The live timeline as loaded by the sync, for the welcome after login.
    events,
    getLiveTimeline: () => ({ getEvents: () => events }),
    hasUserReadEvent: vi.fn<(userId: string, eventId: string) => boolean>(
      () => false,
    ),
    findEventById: vi.fn((): unknown => ({})),
    getAccountData: vi.fn((): unknown => undefined),
  };
};

const setLevel = (target: ReturnType<typeof makeRoom>, level: string) =>
  target.getAccountData.mockReturnValue({ getContent: () => ({ level }) });

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

// `age` is how old the server said the event was when it arrived; the
// event's own timestamp reads as fresh, as on a client whose clock is behind.
const makeEvent = (
  id: string,
  {
    type = 'm.room.message',
    age = 0,
    sender = '@alice:x',
    content = { body: 'hi', 'm.mentions': { user_ids: [ME] } } as any,
  } = {},
) => {
  const event: any = new EventEmitter();
  const receivedAt = Date.now();
  Object.assign(event, {
    getId: () => id,
    getTs: () => receivedAt,
    getLocalAge: () => age + Date.now() - receivedAt,
    getSender: () => sender,
    sender: { name: 'Alice' },
    getType: () => type,
    isRedacted: () => false,
    isDecryptionFailure: () => false,
    getContent: () => content,
  });
  return event;
};

describe('MatrixAskToasts', () => {
  let room: ReturnType<typeof makeRoom>;

  const renderToasts = () => render(<MatrixAskToasts />);

  const emitTimeline = (
    event: any,
    target: any = room,
    toStartOfTimeline = false,
    liveEvent = true,
  ) =>
    h.client.emit('Room.timeline', event, target, toStartOfTimeline, false, {
      liveEvent,
    });

  const emitMention = (id: string) => {
    const event = makeEvent(id);
    emitTimeline(event);
    return event;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Removes the previous test's toasts, rather than only closing them.
    toastStore.dismiss();
    vi.advanceTimersByTime(200);
    vi.mocked(show).mockClear();
    vi.mocked(dismiss).mockClear();
    vi.mocked(openSupportDrawer).mockClear();
    room = makeRoom();
    h.rooms = [makeWaldurRoom()];
    h.connectionState = 'connected';
    h.userId = ME;
    h.client = Object.assign(new EventEmitter(), {
      isInitialSyncComplete: () => true,
      getPushActionsForEvent: vi.fn(() => ({
        notify: true,
        tweaks: { highlight: true },
      })),
      pushRules: { global: { override: [] as any[] } },
      getRoomPushRule: vi.fn(() => null),
      getRoom: vi.fn(() => room),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // The stub shadows jsdom's prototype getter; deleting it restores it.
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('shows one toast per room after the delay', () => {
    renderToasts();
    emitMention('$e1');
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.objectContaining({
        id: askToastId('!r:x'),
        duration: ASK_TOAST_DURATION_MS,
      }),
    );
  });

  // Any member can change their Matrix display name from another client.
  it('names the sender by their Waldur name', () => {
    h.rooms = [
      {
        ...makeWaldurRoom(),
        members: [
          {
            matrix_user_id: '@alice:x',
            user_full_name: 'Alice Smith',
            membership_state: 'joined',
          },
        ],
      },
    ];
    renderToasts();
    const event = makeEvent('$e1');
    event.sender = { name: 'Waldur Support' };
    emitTimeline(event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice Smith mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  it('says an @room notified everyone', () => {
    renderToasts();
    emitTimeline(
      makeEvent('$e1', {
        content: { body: '@room hi', 'm.mentions': { room: true } },
      }),
    );
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice notified everyone',
      'Project X',
      expect.anything(),
    );
  });

  it('updates the same toast for a second ask in the room', () => {
    renderToasts();
    emitMention('$e1');
    emitMention('$e2');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenLastCalledWith(
      'info',
      '2 mentions',
      'Project X',
      expect.objectContaining({ id: askToastId('!r:x') }),
    );
  });

  it('skips the toast if the event was read during the delay', () => {
    renderToasts();
    emitMention('$e1');
    room.hasUserReadEvent.mockReturnValue(true);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(room.hasUserReadEvent).toHaveBeenCalledWith(ME, '$e1');
    expect(show).not.toHaveBeenCalled();
  });

  it('skips the toast if the event was redacted during the delay', () => {
    renderToasts();
    const event = emitMention('$e1');
    event.isRedacted = () => true;
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  // After a logout or impersonation the counts would land in another
  // person's toast.
  it('forgets ask counts when the Matrix user changes', () => {
    const view = renderToasts();
    emitMention('$e1');
    emitMention('$e2');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenLastCalledWith(
      'info',
      '2 mentions',
      'Project X',
      expect.anything(),
    );

    h.userId = '@bob:x';
    view.rerender(<MatrixAskToasts />);
    expect(dismiss).toHaveBeenCalledWith(askToastId('!r:x'));

    emitTimeline(
      makeEvent('$e3', {
        content: { body: 'hi', 'm.mentions': { user_ids: ['@bob:x'] } },
      }),
    );
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenLastCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  it('ignores events before the initial sync completes', () => {
    renderToasts();
    h.client.isInitialSyncComplete = () => false;
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  // By the server's clock: the client's can be off.
  it('ignores events older than five minutes', () => {
    renderToasts();
    emitTimeline(makeEvent('$e1', { age: ASK_MAX_EVENT_AGE_MS + 1 }));
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  it('ignores back-paginated and non-live events', () => {
    renderToasts();
    emitTimeline(makeEvent('$e1'), room, true, true);
    emitTimeline(makeEvent('$e2'), room, false, false);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  // The room list is refetched only after the join reaches the client.
  it('toasts a mention in a room listed only after the event', () => {
    h.rooms = [];
    const view = renderToasts();
    emitMention('$e1');
    h.rooms = [makeWaldurRoom()];
    view.rerender(<MatrixAskToasts />);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  it('ignores rooms that are not Waldur rooms', () => {
    renderToasts();
    emitTimeline(makeEvent('$e1'), makeRoom('!dm:x'));
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  // Operators can rename the bot, so its localpart need not end in -bot.
  it('ignores the room bot under any name', () => {
    h.rooms = [{ ...makeWaldurRoom(), bot_user_id: '@assistant:x' }];
    renderToasts();
    emitTimeline(makeEvent('$e1', { sender: '@assistant:x' }));
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  it('ignores muted rooms', () => {
    renderToasts();
    h.client.getRoomPushRule.mockReturnValue({ actions: ['dont_notify'] });
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  it('shows nothing for a mention in a muted room', () => {
    renderToasts();
    h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  it('does not toast a pending ask when the room is muted during the delay', () => {
    renderToasts();
    emitMention('$e1');
    h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  it('drops a parked toast when the room is muted while the tab is hidden', () => {
    renderToasts();
    setVisibility('hidden');
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];

    setVisibility('visible');
    expect(show).not.toHaveBeenCalled();
  });

  it('dismisses a toast when its room is muted', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    h.client.emit('accountData', makeEvent('$rules'));
    expect(dismiss).not.toHaveBeenCalled();

    h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
    h.client.emit('accountData', makeEvent('$rules'));
    expect(dismiss).toHaveBeenCalledWith(askToastId('!r:x'));

    h.client.pushRules.global.override = [];
    emitMention('$e2');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenLastCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  describe('plain messages', () => {
    const emitMessage = (id: string, options = {}) => {
      const event = makeEvent(id, { content: { body: 'hi' }, ...options });
      emitTimeline(event);
      return event;
    };

    beforeEach(() => {
      h.client.getPushActionsForEvent.mockReturnValue({
        notify: true,
        tweaks: {},
      });
    });

    it('shows a toast for a plain message in a room set to All', () => {
      setLevel(room, 'all');
      renderToasts();
      emitMessage('$e1');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).toHaveBeenCalledWith(
        'info',
        'New message from Alice',
        'Project X',
        expect.objectContaining({ id: askToastId('!r:x') }),
      );
    });

    it('does not toast a pending message when the room leaves All during the delay', () => {
      setLevel(room, 'all');
      renderToasts();
      emitMessage('$e1');
      setLevel(room, 'mentions');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).not.toHaveBeenCalled();
    });

    it('shows nothing for a plain message at the default level', () => {
      renderToasts();
      emitMessage('$e1');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).not.toHaveBeenCalled();
    });

    it('counts the new messages in a room set to All', () => {
      setLevel(room, 'all');
      renderToasts();
      emitMessage('$e1');
      emitMessage('$e2');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).toHaveBeenLastCalledWith(
        'info',
        '2 new messages',
        'Project X',
        expect.anything(),
      );
    });

    // The ask is what the user should not miss.
    it('keeps the ask wording for a message after an ask', () => {
      setLevel(room, 'all');
      renderToasts();
      h.client.getPushActionsForEvent.mockReturnValueOnce({
        notify: true,
        tweaks: { highlight: true },
      });
      emitMention('$e1');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      emitMessage('$e2');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).toHaveBeenCalledTimes(2);
      expect(show).toHaveBeenLastCalledWith(
        'info',
        'Alice mentioned you',
        'Project X',
        expect.anything(),
      );
    });

    it('ignores own messages and edits in a room set to All', () => {
      setLevel(room, 'all');
      renderToasts();
      emitMessage('$e1', { sender: ME });
      emitMessage('$e2', {
        content: {
          body: '* hi',
          'm.relates_to': { rel_type: 'm.replace', event_id: '$e0' },
        },
      });
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).not.toHaveBeenCalled();
    });

    it('drops a parked message when the room leaves All while hidden', () => {
      setLevel(room, 'all');
      renderToasts();
      setVisibility('hidden');
      emitMessage('$e1');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      setLevel(room, 'mentions');

      setVisibility('visible');
      expect(show).not.toHaveBeenCalled();
    });

    it('keeps a parked ask when the room leaves All while hidden', () => {
      setLevel(room, 'all');
      renderToasts();
      setVisibility('hidden');
      h.client.getPushActionsForEvent.mockReturnValueOnce({
        notify: true,
        tweaks: { highlight: true },
      });
      emitMention('$e1');
      emitMessage('$e2');
      vi.advanceTimersByTime(ASK_DELAY_MS);
      setLevel(room, 'mentions');

      setVisibility('visible');
      expect(show).toHaveBeenCalledWith(
        'info',
        'Alice mentioned you',
        'Project X',
        expect.anything(),
      );
    });

    it('waits for decryption before toasting a message', () => {
      setLevel(room, 'all');
      renderToasts();
      let type = 'm.room.encrypted';
      const event = makeEvent('$e1', { content: { body: 'hi' } });
      event.getType = () => type;
      emitTimeline(event);
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).not.toHaveBeenCalled();

      type = 'm.room.message';
      event.emit('Event.decrypted', event);
      vi.advanceTimersByTime(ASK_DELAY_MS);
      expect(show).toHaveBeenCalledWith(
        'info',
        'New message from Alice',
        'Project X',
        expect.anything(),
      );
    });
  });

  it('waits for decryption before deciding', () => {
    renderToasts();
    let type = 'm.room.encrypted';
    const event = makeEvent('$e1');
    event.getType = () => type;
    emitTimeline(event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();

    type = 'm.room.message';
    event.emit('Event.decrypted', event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  // A room key can arrive after the message: the SDK then retries the
  // decryption and emits Event.decrypted again.
  it('toasts a mention whose key arrives after a failed first decryption', () => {
    renderToasts();
    let type = 'm.room.encrypted';
    const event = makeEvent('$e1');
    event.getType = () => type;
    emitTimeline(event);
    event.emit('Event.decrypted', event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();

    type = 'm.room.message';
    event.emit('Event.decrypted', event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledTimes(1);
    expect(event.listenerCount('Event.decrypted')).toBe(0);
  });

  it('keeps waiting after a decryption failure', () => {
    renderToasts();
    const event = makeEvent('$e1', { type: 'm.room.encrypted' });
    emitTimeline(event);
    event.getType = () => 'm.room.message';
    event.isDecryptionFailure = () => true;
    event.emit('Event.decrypted', event, new Error('no key'));
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();

    event.isDecryptionFailure = () => false;
    event.emit('Event.decrypted', event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledTimes(1);
  });

  it('stops waiting for a key once the ask is too old', () => {
    renderToasts();
    let type = 'm.room.encrypted';
    const event = makeEvent('$e1');
    event.getType = () => type;
    emitTimeline(event);
    vi.advanceTimersByTime(ASK_MAX_EVENT_AGE_MS + 1);
    expect(event.listenerCount('Event.decrypted')).toBe(0);

    type = 'm.room.message';
    event.emit('Event.decrypted', event);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();
  });

  it('keeps a pending toast when the room list changes during the delay', () => {
    const view = renderToasts();
    emitMention('$e1');
    h.rooms = [makeWaldurRoom('Project Y')];
    view.rerender(<MatrixAskToasts />);
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice mentioned you',
      'Project Y',
      expect.anything(),
    );
  });

  it('dismisses the room toast when an own read receipt covers the ask', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(dismiss).not.toHaveBeenCalled();

    room.hasUserReadEvent.mockReturnValue(true);
    h.client.emit('Room.receipt', makeEvent('$receipt'), room);
    expect(room.hasUserReadEvent).toHaveBeenLastCalledWith(ME, '$e1');
    expect(dismiss).toHaveBeenCalledWith(askToastId('!r:x'));
  });

  it('starts counting again after the room is read', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    room.hasUserReadEvent.mockReturnValue(true);
    h.client.emit('Room.receipt', makeEvent('$receipt'), room);

    room.hasUserReadEvent.mockReturnValue(false);
    emitMention('$e2');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenLastCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  // A gappy sync resets the live timeline, after which the event's read
  // state can no longer be told.
  it('forgets an ask whose event left the timeline', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    room.findEventById.mockReturnValue(undefined);
    room.hasUserReadEvent.mockClear();
    h.client.emit('Room.receipt', makeEvent('$receipt'), room);
    expect(room.hasUserReadEvent).not.toHaveBeenCalled();

    room.findEventById.mockReturnValue({});
    emitMention('$e2');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).toHaveBeenLastCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  // Radix pauses a toast's timer on window blur only while a toast is open,
  // so one shown in a hidden tab would time out unseen.
  it('shows a parked toast when the tab becomes visible', () => {
    renderToasts();
    setVisibility('hidden');
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    expect(show).not.toHaveBeenCalled();

    setVisibility('visible');
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.objectContaining({
        id: askToastId('!r:x'),
        duration: ASK_TOAST_DURATION_MS,
      }),
    );
  });

  it('counts the asks parked while hidden', () => {
    renderToasts();
    setVisibility('hidden');
    emitMention('$e1');
    emitMention('$e2');
    vi.advanceTimersByTime(ASK_DELAY_MS);

    setVisibility('visible');
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith(
      'info',
      '2 mentions',
      'Project X',
      expect.anything(),
    );
  });

  // E.g. the screen unlocks while the sync is still in error after a sleep.
  it('shows a parked toast when the tab became visible while disconnected', () => {
    const view = renderToasts();
    setVisibility('hidden');
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    h.connectionState = 'error';
    view.rerender(<MatrixAskToasts />);
    setVisibility('visible');
    expect(show).not.toHaveBeenCalled();

    h.connectionState = 'connected';
    view.rerender(<MatrixAskToasts />);
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenCalledWith(
      'info',
      'Alice mentioned you',
      'Project X',
      expect.anything(),
    );
  });

  it('drops a parked toast read elsewhere while hidden', () => {
    renderToasts();
    setVisibility('hidden');
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    room.hasUserReadEvent.mockReturnValue(true);
    h.client.emit('Room.receipt', makeEvent('$receipt'), room);
    room.hasUserReadEvent.mockReturnValue(false);

    setVisibility('visible');
    expect(show).not.toHaveBeenCalled();
  });

  it('drops a parked toast that is read by the time the tab is visible', () => {
    renderToasts();
    setVisibility('hidden');
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    room.hasUserReadEvent.mockReturnValue(true);

    setVisibility('visible');
    expect(show).not.toHaveBeenCalled();
  });

  it('keeps the toast for a receipt that does not cover the ask', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    h.client.emit('Room.receipt', makeEvent('$receipt'), room);
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('dismisses the room toast when the ask is redacted', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    const redaction = Object.assign(makeEvent('$redaction'), {
      getAssociatedId: () => '$e1',
    });
    h.client.emit('Room.redaction', redaction, room);
    expect(dismiss).toHaveBeenCalledWith(askToastId('!r:x'));
  });

  it('opens the chat drawer at the room from the toast action', () => {
    renderToasts();
    emitMention('$e1');
    vi.advanceTimersByTime(ASK_DELAY_MS);
    const { actions } = vi.mocked(show).mock.calls[0][3];
    expect(actions[0]).toMatchObject({ label: 'Open chat', primary: true });

    actions[0].onClick();
    expect(openSupportDrawer).toHaveBeenCalledWith(h.openDrawer, {
      defaultRoomUuid: 'room-uuid',
    });
  });

  it('stops listening and drops pending asks on unmount', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const welcome = makeEvent('$w', { sender: BOT, type: 'm.room.encrypted' });
    room.events.push(welcome);
    const view = renderToasts();
    const encrypted = makeEvent('$e2', { type: 'm.room.encrypted' });
    emitMention('$e1');
    emitTimeline(encrypted);

    view.unmount();
    vi.advanceTimersByTime(ASK_DELAY_MS);

    expect(show).not.toHaveBeenCalled();
    expect(h.client.listenerCount('Room.timeline')).toBe(0);
    expect(h.client.listenerCount('Room.receipt')).toBe(0);
    expect(h.client.listenerCount('Room.redaction')).toBe(0);
    expect(h.client.listenerCount('accountData')).toBe(0);
    expect(encrypted.listenerCount('Event.decrypted')).toBe(0);
    expect(welcome.listenerCount('Event.decrypted')).toBe(0);
    expect(removeListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
    removeListener.mockRestore();
  });

  describe('welcome', () => {
    const WELCOME_TITLE = 'You were added to a team chat';
    const WELCOME_CONTENT = {
      body: "**Welcome to this project's team chat!**",
      'm.mentions': {},
      'com.waldur.welcome': true,
    };
    // Sent before the login, or before the member joined the room.
    const HOUR = 3600000;

    const makeWelcome = (id = '$w', options = {}) =>
      makeEvent(id, { sender: BOT, content: WELCOME_CONTENT, ...options });
    // Posted right after a member joined, naming them.
    const makeRoleNotice = (id: string, userId: string, options = {}) =>
      makeEvent(id, {
        sender: BOT,
        content: {
          body: 'Someone has been granted the member role.',
          'm.mentions': { user_ids: [userId] },
          'com.waldur.welcome': true,
        },
        ...options,
      });

    // What the toast provider does when a toast closes, on its timeout, its
    // X, a swipe or its action.
    const closeToast = (id: string) => toastStore.dismiss(id);

    beforeEach(() => {
      // The welcome mentions nobody.
      h.client.getPushActionsForEvent.mockReturnValue({
        notify: true,
        tweaks: {},
      });
    });

    describe('live', () => {
      it("toasts the room bot's welcome after the delay", () => {
        renderToasts();
        emitTimeline(makeWelcome());
        expect(show).not.toHaveBeenCalled();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.objectContaining({
            id: askToastId('!r:x'),
            duration: ASK_TOAST_DURATION_MS,
          }),
        );
      });

      it("toasts the room's welcome to every member", () => {
        h.userId = '@carol:x';
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });

      it('toasts my role notice as my welcome', () => {
        renderToasts();
        emitTimeline(makeRoleNotice('$n', ME));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });

      it("shows nothing for another member's role notice", () => {
        setLevel(room, 'all');
        renderToasts();
        emitTimeline(makeRoleNotice('$n', '@bob:x'));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('shows nothing for my role notice in a muted room', () => {
        h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
        renderToasts();
        emitTimeline(makeRoleNotice('$n', ME));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('does not toast my role notice when the room is muted during the delay', () => {
        renderToasts();
        emitTimeline(makeRoleNotice('$n', ME));
        h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('treats a role notice naming me from another member as their mention', () => {
        h.client.getPushActionsForEvent.mockReturnValue({
          notify: true,
          tweaks: { highlight: true },
        });
        renderToasts();
        emitTimeline(makeRoleNotice('$n', ME, { sender: '@alice:x' }));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          'Alice mentioned you',
          'Project X',
          expect.anything(),
        );
      });

      it('names a room without a scope by its room name', () => {
        h.rooms = [makeWaldurRoom(null)];
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X chat',
          expect.anything(),
        );
      });

      it('opens the room from the welcome toast', () => {
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        const { actions } = vi.mocked(show).mock.calls[0][3];
        expect(actions[0]).toMatchObject({ label: 'Open chat', primary: true });

        actions[0].onClick();
        expect(openSupportDrawer).toHaveBeenCalledWith(h.openDrawer, {
          defaultRoomUuid: 'room-uuid',
        });
      });

      // Any member can put the marker in a message of their own.
      it('treats the marker from another member as their message', () => {
        setLevel(room, 'all');
        renderToasts();
        emitTimeline(makeEvent('$e1', { content: WELCOME_CONTENT }));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          'New message from Alice',
          'Project X',
          expect.anything(),
        );
      });

      it('shows nothing for the marker from another member at the default level', () => {
        renderToasts();
        emitTimeline(makeEvent('$e1', { content: WELCOME_CONTENT }));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('toasts a mention that carries the marker as a mention', () => {
        h.client.getPushActionsForEvent.mockReturnValue({
          notify: true,
          tweaks: { highlight: true },
        });
        renderToasts();
        emitTimeline(
          makeEvent('$e1', {
            content: { ...WELCOME_CONTENT, 'm.mentions': { user_ids: [ME] } },
          }),
        );
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledWith(
          'info',
          'Alice mentioned you',
          'Project X',
          expect.anything(),
        );
      });

      it.each(['mentions', 'all'])(
        'toasts the welcome in a room set to %s',
        (level) => {
          setLevel(room, level);
          renderToasts();
          emitTimeline(makeWelcome());
          vi.advanceTimersByTime(ASK_DELAY_MS);
          expect(show).toHaveBeenCalledWith(
            'info',
            WELCOME_TITLE,
            'Project X',
            expect.anything(),
          );
        },
      );

      it('shows nothing for the welcome in a muted room', () => {
        h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('does not toast the welcome when the room is muted during the delay', () => {
        renderToasts();
        emitTimeline(makeWelcome());
        h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      // The cap keeps old asks that arrive late quiet; a welcome that arrives
      // late still tells the member the chat exists.
      it('toasts a welcome older than five minutes', () => {
        renderToasts();
        emitTimeline(makeWelcome('$w', { age: ASK_MAX_EVENT_AGE_MS + 1 }));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.anything(),
        );
      });

      it('keeps the age cap for the marker from another member', () => {
        setLevel(room, 'all');
        renderToasts();
        emitTimeline(
          makeEvent('$e1', {
            content: WELCOME_CONTENT,
            age: ASK_MAX_EVENT_AGE_MS + 1,
          }),
        );
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('waits for an old welcome to decrypt', () => {
        renderToasts();
        const event = makeWelcome('$w', {
          type: 'm.room.encrypted',
          age: HOUR,
        });
        emitTimeline(event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        event.getType = () => 'm.room.message';
        event.emit('Event.decrypted', event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.anything(),
        );
        expect(event.listenerCount('Event.decrypted')).toBe(0);
      });

      it('ignores other bot messages', () => {
        renderToasts();
        emitTimeline(makeEvent('$e1', { sender: BOT, age: HOUR }));
        emitTimeline(makeEvent('$e2', { sender: BOT }));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('skips the welcome if it was redacted during the delay', () => {
        renderToasts();
        const event = makeWelcome();
        emitTimeline(event);
        event.isRedacted = () => true;
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('skips the welcome if it was read during the delay', () => {
        renderToasts();
        emitTimeline(makeWelcome());
        room.hasUserReadEvent.mockReturnValue(true);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(room.hasUserReadEvent).toHaveBeenCalledWith(ME, '$w');
        expect(show).not.toHaveBeenCalled();
      });

      it('shows a parked welcome when the tab becomes visible', () => {
        renderToasts();
        setVisibility('hidden');
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        setVisibility('visible');
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });

      it('dismisses the welcome when it is read, here or in another tab', () => {
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        room.hasUserReadEvent.mockReturnValue(true);
        h.client.emit('Room.receipt', makeEvent('$receipt'), room);
        expect(room.hasUserReadEvent).toHaveBeenLastCalledWith(ME, '$w');
        expect(dismiss).toHaveBeenCalledWith(askToastId('!r:x'));
      });

      // The welcome is no mention: the first one after it is "mentioned you",
      // not "2 mentions".
      it('replaces the welcome with a later mention', () => {
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        h.client.getPushActionsForEvent.mockReturnValue({
          notify: true,
          tweaks: { highlight: true },
        });
        emitTimeline(makeEvent('$e1'));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(2);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          'Alice mentioned you',
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });

      it('replaces the welcome with a later message in a room set to All', () => {
        setLevel(room, 'all');
        renderToasts();
        emitTimeline(makeWelcome());
        vi.advanceTimersByTime(ASK_DELAY_MS);
        emitTimeline(makeEvent('$e1', { content: { body: 'hi' } }));
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          'New message from Alice',
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });
    });

    describe('after login', () => {
      it('toasts an unread welcome found in the timeline', () => {
        room.events.push(makeWelcome('$w', { age: HOUR }));
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(room.hasUserReadEvent).toHaveBeenCalledWith(ME, '$w');
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });

      // What came before a member's join counts as read for them.
      it("toasts my role notice when the room's welcome came before my join", () => {
        room.hasUserReadEvent.mockImplementation(
          (_userId: string, eventId: string) => eventId === '$w',
        );
        room.events.push(
          makeWelcome('$w', { age: HOUR }),
          makeRoleNotice('$n', ME, { age: HOUR }),
        );
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(room.hasUserReadEvent).toHaveBeenCalledWith(ME, '$n');
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.objectContaining({ id: askToastId('!r:x') }),
        );
      });

      // The chat's first members get both.
      it('toasts the welcome and my role notice in one room once', () => {
        room.events.push(
          makeWelcome('$w', { age: HOUR }),
          makeRoleNotice('$n', ME, { age: HOUR }),
        );
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
      });

      it("shows nothing for another member's role notice in the timeline", () => {
        room.events.push(makeRoleNotice('$n', '@bob:x', { age: HOUR }));
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('shows nothing for a welcome already read', () => {
        room.hasUserReadEvent.mockReturnValue(true);
        room.events.push(makeWelcome('$w', { age: HOUR }));
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      // Rooms that had a chat before the welcome existed have none.
      it('shows nothing for other events in the timeline', () => {
        room.events.push(
          makeEvent('$e1'),
          makeEvent('$e2', { sender: BOT }),
          makeEvent('$e3', { content: WELCOME_CONTENT }),
        );
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();
      });

      it('waits for the initial sync before looking for the welcome', () => {
        h.client.isInitialSyncComplete = () => false;
        room.events.push(makeWelcome('$w', { age: HOUR }));
        const view = renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        h.client.isInitialSyncComplete = () => true;
        h.rooms = [makeWaldurRoom()];
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
      });

      it('waits for a welcome in the timeline to decrypt', () => {
        const event = makeWelcome('$w', {
          type: 'm.room.encrypted',
          age: HOUR,
        });
        room.events.push(event);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        event.getType = () => 'm.room.message';
        event.emit('Event.decrypted', event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.anything(),
        );
      });

      // The room list is refetched only after the join reaches the client.
      it('toasts the welcome of a room listed only after it arrived', () => {
        h.rooms = [];
        const view = renderToasts();
        const event = makeWelcome();
        room.events.push(event);
        emitTimeline(event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        h.rooms = [makeWaldurRoom()];
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.anything(),
        );
      });

      it('toasts an encrypted welcome in a room listed before its key arrives', () => {
        h.rooms = [];
        const view = renderToasts();
        const event = makeWelcome('$w', { type: 'm.room.encrypted' });
        room.events.push(event);
        emitTimeline(event);
        h.rooms = [makeWaldurRoom()];
        view.rerender(<MatrixAskToasts />);
        event.getType = () => 'm.room.message';
        event.emit('Event.decrypted', event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          WELCOME_TITLE,
          'Project X',
          expect.anything(),
        );
      });

      // A key restored from backup can come late.
      it('toasts a welcome whose key arrives after five minutes', () => {
        const event = makeWelcome('$w', {
          type: 'm.room.encrypted',
          age: HOUR,
        });
        room.events.push(event);
        renderToasts();
        vi.advanceTimersByTime(ASK_MAX_EVENT_AGE_MS + 1);
        event.getType = () => 'm.room.message';
        event.emit('Event.decrypted', event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(event.listenerCount('Event.decrypted')).toBe(0);
      });

      it('toasts a welcome once per session', () => {
        const event = makeWelcome('$w', { age: HOUR });
        room.events.push(event);
        const view = renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);

        // Muting closes the toast and forgets the room's ask.
        h.client.pushRules.global.override = [{ rule_id: '!r:x', actions: [] }];
        h.client.emit('accountData', makeEvent('$rules'));
        h.client.pushRules.global.override = [];
        h.connectionState = 'error';
        view.rerender(<MatrixAskToasts />);
        h.connectionState = 'connected';
        h.rooms = [makeWaldurRoom()];
        view.rerender(<MatrixAskToasts />);
        emitTimeline(event);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
      });

      it('keeps a mention toast over a welcome found later', () => {
        h.client.getPushActionsForEvent.mockReturnValue({
          notify: true,
          tweaks: { highlight: true },
        });
        const view = renderToasts();
        emitTimeline(makeEvent('$e1'));
        vi.advanceTimersByTime(ASK_DELAY_MS);

        room.events.push(makeWelcome('$w', { age: HOUR }));
        h.rooms = [makeWaldurRoom()];
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          'Alice mentioned you',
          'Project X',
          expect.anything(),
        );
      });

      it('looks again after a reconnect cut the delay short', () => {
        room.events.push(makeWelcome('$w', { age: HOUR }));
        const view = renderToasts();
        h.connectionState = 'error';
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        h.connectionState = 'connected';
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
      });
    });

    // E.g. a customer owner added to every project chat of the customer.
    describe('several at once', () => {
      const summaryTitle = (count: number) =>
        `You were added to ${count} team chats`;

      const listWelcomedRooms = (count: number, prefix = 'r') => {
        const rooms = Array.from({ length: count }, (_, i) =>
          makeRoom(`!${prefix}${i}:x`),
        );
        rooms.forEach((target, i) =>
          target.events.push(makeWelcome(`$${prefix}${i}`, { age: HOUR })),
        );
        h.rooms = rooms.map((target, i) => ({
          ...makeWaldurRoom(`Project ${i}`),
          uuid: `${prefix}-${i}`,
          room_id: target.roomId,
        }));
        h.client.getRoom.mockImplementation((roomId: string) =>
          rooms.find((target) => target.roomId === roomId),
        );
        return rooms;
      };

      const readRoom = (target: ReturnType<typeof makeRoom>) => {
        target.hasUserReadEvent.mockReturnValue(true);
        h.client.emit('Room.receipt', makeEvent('$receipt'), target);
      };

      it('shows up to three welcomes one by one', () => {
        listWelcomedRooms(3);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(3);
        [0, 1, 2].forEach((i) =>
          expect(show).toHaveBeenCalledWith(
            'info',
            WELCOME_TITLE,
            `Project ${i}`,
            expect.objectContaining({ id: askToastId(`!r${i}:x`) }),
          ),
        );
      });

      it('collapses more than three welcomes into one toast', () => {
        listWelcomedRooms(4);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          summaryTitle(4),
          undefined,
          expect.objectContaining({
            id: WELCOME_SUMMARY_TOAST_ID,
            duration: ASK_TOAST_DURATION_MS,
          }),
        );
      });

      it('opens the room list from the collapsed toast', () => {
        listWelcomedRooms(4);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        const { actions } = vi.mocked(show).mock.calls[0][3];
        expect(actions[0]).toMatchObject({ label: 'Open chat', primary: true });

        actions[0].onClick();
        expect(openSupportDrawer).toHaveBeenCalledWith(h.openDrawer, {
          roomList: true,
        });
      });

      it('collapses a fourth welcome with the three on screen', () => {
        const rooms = listWelcomedRooms(4);
        const late = rooms[3].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(3);

        emitTimeline(late, rooms[3]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        [0, 1, 2].forEach((i) =>
          expect(dismiss).toHaveBeenCalledWith(askToastId(`!r${i}:x`)),
        );
        expect(show).toHaveBeenCalledTimes(4);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          summaryTitle(4),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
      });

      it('shows a welcome on its own once the earlier ones closed', () => {
        const rooms = listWelcomedRooms(4);
        const late = rooms[3].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        [0, 1, 2].forEach((i) => closeToast(askToastId(`!r${i}:x`)));

        emitTimeline(late, rooms[3]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(dismiss).not.toHaveBeenCalled();
        expect(show).toHaveBeenLastCalledWith(
          'info',
          WELCOME_TITLE,
          'Project 3',
          expect.objectContaining({ id: askToastId('!r3:x') }),
        );
      });

      it('adds a later welcome to the collapsed toast on screen', () => {
        const rooms = listWelcomedRooms(5);
        const late = rooms[4].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);

        emitTimeline(late, rooms[4]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(2);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          summaryTitle(5),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
      });

      it('shows a later welcome on its own once the collapsed toast was opened', () => {
        const rooms = listWelcomedRooms(5);
        const late = rooms[4].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        vi.mocked(show).mock.calls[0][3].actions[0].onClick();
        closeToast(WELCOME_SUMMARY_TOAST_ID);

        emitTimeline(late, rooms[4]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          WELCOME_TITLE,
          'Project 4',
          expect.objectContaining({ id: askToastId('!r4:x') }),
        );
      });

      it('counts down as the rooms are read and closes when all are', () => {
        const rooms = listWelcomedRooms(4);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);

        readRoom(rooms[0]);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          summaryTitle(3),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );

        readRoom(rooms[1]);
        readRoom(rooms[2]);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          WELCOME_TITLE,
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
        expect(dismiss).not.toHaveBeenCalledWith(WELCOME_SUMMARY_TOAST_ID);

        readRoom(rooms[3]);
        expect(dismiss).toHaveBeenCalledWith(WELCOME_SUMMARY_TOAST_ID);
        expect(show).toHaveBeenCalledTimes(4);
      });

      it('does not bring back a collapsed toast closed with its X', () => {
        const rooms = listWelcomedRooms(4);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        const openToasts = () =>
          toastStore
            .getSnapshot()
            .filter((toast) => toast.open)
            .map((toast) => [toast.id, toast.title]);
        expect(openToasts()).toEqual([
          [WELCOME_SUMMARY_TOAST_ID, summaryTitle(4)],
        ]);

        closeToast(WELCOME_SUMMARY_TOAST_ID);
        readRoom(rooms[0]);
        expect(openToasts()).toEqual([]);
        expect(show).toHaveBeenCalledTimes(1);
      });

      it('shows a later welcome on its own once the collapsed toast timed out', () => {
        const rooms = listWelcomedRooms(5);
        const late = rooms[4].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        closeToast(WELCOME_SUMMARY_TOAST_ID);

        emitTimeline(late, rooms[4]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          WELCOME_TITLE,
          'Project 4',
          expect.objectContaining({ id: askToastId('!r4:x') }),
        );
      });

      // Radix pauses a toast's timer on hover and on window blur.
      it('counts down a collapsed toast held open past its duration', () => {
        const rooms = listWelcomedRooms(4);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        vi.advanceTimersByTime(4 * ASK_TOAST_DURATION_MS);

        readRoom(rooms[0]);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          summaryTitle(3),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
      });

      it('collapses a fourth welcome with three held open past their duration', () => {
        const rooms = listWelcomedRooms(4);
        const late = rooms[3].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        vi.advanceTimersByTime(4 * ASK_TOAST_DURATION_MS);

        emitTimeline(late, rooms[3]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          summaryTitle(4),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
      });

      it('does not count a welcome closed early towards the collapse', () => {
        const rooms = listWelcomedRooms(4);
        const late = rooms[3].events.pop();
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        closeToast(askToastId('!r0:x'));

        emitTimeline(late, rooms[3]);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(dismiss).not.toHaveBeenCalled();
        expect(show).toHaveBeenLastCalledWith(
          'info',
          WELCOME_TITLE,
          'Project 3',
          expect.objectContaining({ id: askToastId('!r3:x') }),
        );
      });

      it('collapses the welcomes parked while the tab was hidden', () => {
        setVisibility('hidden');
        listWelcomedRooms(4);
        renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).not.toHaveBeenCalled();

        setVisibility('visible');
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(
          'info',
          summaryTitle(4),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
      });

      it('dismisses the collapsed toast when the Matrix user changes', () => {
        listWelcomedRooms(4);
        const view = renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);

        h.userId = '@bob:x';
        view.rerender(<MatrixAskToasts />);
        expect(dismiss).toHaveBeenCalledWith(WELCOME_SUMMARY_TOAST_ID);
      });

      it('toasts the welcome again for the next Matrix user', () => {
        listWelcomedRooms(1);
        const view = renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(1);

        h.userId = '@bob:x';
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenCalledTimes(2);
      });

      it('counts afresh for the next Matrix user', () => {
        listWelcomedRooms(4);
        const view = renderToasts();
        vi.advanceTimersByTime(ASK_DELAY_MS);

        listWelcomedRooms(4, 'b');
        h.userId = '@bob:x';
        view.rerender(<MatrixAskToasts />);
        vi.advanceTimersByTime(ASK_DELAY_MS);
        expect(show).toHaveBeenLastCalledWith(
          'info',
          summaryTitle(4),
          undefined,
          expect.objectContaining({ id: WELCOME_SUMMARY_TOAST_ID }),
        );
      });
    });
  });
});
