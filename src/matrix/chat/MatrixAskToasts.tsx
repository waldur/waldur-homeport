import type { IRoomTimelineData, MatrixEvent, Room } from 'matrix-js-sdk';
import { FunctionComponent, useEffect, useMemo, useRef } from 'react';
import type { MatrixRoom } from 'waldur-js-client';

import { dismiss, show, toastStore } from 'waldur-notifications';

import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { openSupportDrawer } from '@/support/openSupportDrawer';

import {
  ASK_DELAY_MS,
  ASK_MAX_EVENT_AGE_MS,
  ASK_TOAST_DURATION_MS,
  AskKind,
  askToastId,
  getAskKind,
  isNewMessage,
  isWelcome,
  WELCOME_SUMMARY_TOAST_ID,
  WELCOME_TOAST_LIMIT,
} from './askEvents';
import {
  getRoomNotificationLevel,
  RoomNotificationLevel,
} from './notificationLevel';
import { useMatrixClient } from './useMatrixClient';
import { useMemberMatrixRooms } from './useMemberMatrixRooms';
import { resolveMemberName } from './utils';

interface RoomAsks {
  count: number;
  // Plain messages, toasted in a room set to All.
  messages: number;
  lastEventId: string;
  // A plain message after an ask keeps the ask's wording.
  askTitle?: string;
  // Set while the tab is hidden. Radix pauses a toast's timer on window blur
  // only while a toast is already open, so one shown now would time out unseen.
  parkedTitle?: string;
  // The bot's welcome, until a mention or message replaces it. It shows at
  // Mentions only, as an ask does, without counting as one.
  welcome?: boolean;
}

// Still encrypted, or failed for now: a failed attempt is retried when the
// room key arrives later, and the SDK emits Event.decrypted again.
const isUndecrypted = (event: MatrixEvent) =>
  event.getType() === 'm.room.encrypted' || event.isDecryptionFailure();

// Closed on its timeout, X, swipe or action; a timer paused by hover or window
// blur keeps it open.
const isToastOpen = (id: string) =>
  toastStore.getSnapshot().some((toast) => toast.id === id && toast.open);

type ToastKind = AskKind | 'message';

// The Waldur name, as in the timeline: any member can change their Matrix
// display name. Rooms over the member embed cap list only some members.
const senderName = (event: MatrixEvent, waldurRoom: MatrixRoom) =>
  resolveMemberName(
    event.getSender() ?? '',
    new Map(
      (waldurRoom.members ?? []).map((m) => [
        m.matrix_user_id,
        m.user_full_name,
      ]),
    ),
    event.sender?.name,
  );

const askTitle = (kind: AskKind, name: string, count: number) => {
  if (count > 1) return translate('{count} mentions', { count });
  return kind === 'room'
    ? translate('{name} notified everyone', { name })
    : translate('{name} mentioned you', { name });
};

// Mute silences everything; a plain message is toasted only in a room set
// to All.
const levelAllows = (level: RoomNotificationLevel, isAsk: boolean) =>
  level === 'all' || (level === 'mentions' && isAsk);

const messageTitle = (name: string, count: number) =>
  count > 1
    ? translate('{count} new messages', { count })
    : translate('New message from {name}', { name });

const welcomeTitle = (count = 1) =>
  count > 1
    ? translate('You were added to {count} team chats', { count })
    : translate('You were added to a team chat');

/**
 * Toasts a mention, a reply or an admin's `@room` in a Waldur room that is
 * still unread a moment later, wherever the user is in the app, and every
 * other message in a room set to All. Renders nothing: the toast goes through
 * the app's notification store.
 */
export const MatrixAskToasts: FunctionComponent = () => {
  const { client, connectionState, userId } = useMatrixClient();
  const { data: rooms } = useMemberMatrixRooms();
  const { openDrawer } = useDrawer();
  const asksRef = useRef(new Map<string, RoomAsks>());
  // Welcome event ids handled this session, so a reconnect does not toast one
  // again.
  const welcomedRef = useRef(new Set<string>());
  // The rooms the collapsed welcome toast counts.
  const summaryRoomsRef = useRef(new Set<string>());
  const scanWelcomesRef = useRef<(() => void) | null>(null);
  const connected = connectionState === 'connected';

  const waldurRooms = useMemo(
    () =>
      new Map<string, MatrixRoom>(
        (rooms ?? []).filter((r) => r.room_id).map((r) => [r.room_id, r]),
      ),
    [rooms],
  );
  // Read through a ref, so a refetched room list neither re-subscribes nor
  // drops the asks waiting out their delay.
  const waldurRoomsRef = useRef(waldurRooms);
  waldurRoomsRef.current = waldurRooms;

  // Counts belong to one Matrix user: after a logout or impersonation they
  // would land in someone else's toast. Kept apart from the subscription
  // below, which a sync error re-runs without changing the user.
  useEffect(() => {
    const asks = asksRef.current;
    const welcomed = welcomedRef.current;
    return () => {
      asks.forEach((_ask, roomId) => dismiss(askToastId(roomId)));
      asks.clear();
      welcomed.clear();
      dismiss(WELCOME_SUMMARY_TOAST_ID);
    };
  }, [userId]);

  useEffect(() => {
    if (!client || !connected || !userId) return;
    const asks = asksRef.current;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const awaitingDecryption = new Map<MatrixEvent, () => void>();
    const welcomed = welcomedRef.current;
    const summaryRooms = summaryRoomsRef.current;
    // Welcomes share one delay, so a burst collapses before any of them shows.
    const welcomeBatch = new Map<MatrixEvent, Room>();
    let welcomeTimer: ReturnType<typeof setTimeout> | undefined;

    const showToast = (roomId: string, title: string) => {
      const waldurRoom = waldurRoomsRef.current.get(roomId);
      if (!waldurRoom) return;
      show('info', title, waldurRoom.scope_name ?? waldurRoom.room_name, {
        id: askToastId(roomId),
        duration: ASK_TOAST_DURATION_MS,
        actions: [
          {
            label: translate('Open chat'),
            primary: true,
            onClick: () =>
              openSupportDrawer(openDrawer, {
                defaultRoomUuid: waldurRoom.uuid,
              }),
          },
        ],
      });
    };

    const showWelcomeSummary = () => {
      show('info', welcomeTitle(summaryRooms.size), undefined, {
        id: WELCOME_SUMMARY_TOAST_ID,
        duration: ASK_TOAST_DURATION_MS,
        actions: [
          {
            label: translate('Open chat'),
            primary: true,
            onClick: () => openSupportDrawer(openDrawer, { roomList: true }),
          },
        ],
      });
    };

    const showWelcomes = (roomIds: string[]) => {
      if (!roomIds.length) return;
      if (!isToastOpen(WELCOME_SUMMARY_TOAST_ID)) summaryRooms.clear();
      const onScreen = [...asks]
        .filter(
          ([roomId, ask]) => ask.welcome && isToastOpen(askToastId(roomId)),
        )
        .map(([roomId]) => roomId);
      if (
        !summaryRooms.size &&
        onScreen.length + roomIds.length <= WELCOME_TOAST_LIMIT
      ) {
        roomIds.forEach((roomId) => showToast(roomId, welcomeTitle()));
        return;
      }
      // Once collapsed, it stays one toast until it closes.
      onScreen.forEach((roomId) => dismiss(askToastId(roomId)));
      [...onScreen, ...roomIds].forEach((roomId) => summaryRooms.add(roomId));
      showWelcomeSummary();
    };

    // showAsk's checks that apply to the welcome; showWelcomes shows it.
    const addWelcome = (event: MatrixEvent, room: Room) => {
      const eventId = event.getId();
      const waldurRoom = waldurRoomsRef.current.get(room.roomId);
      if (!waldurRoom || welcomed.has(eventId)) return false;
      welcomed.add(eventId);
      // A room with a toast of its own needs no welcome.
      if (
        !isWelcome(event, waldurRoom.bot_user_id, userId) ||
        asks.has(room.roomId)
      ) {
        return false;
      }
      if (room.hasUserReadEvent(userId, eventId)) return false;
      if (getRoomNotificationLevel(client, room.roomId) === 'mute')
        return false;
      const visible = document.visibilityState === 'visible';
      asks.set(room.roomId, {
        count: 0,
        messages: 0,
        lastEventId: eventId,
        welcome: true,
        parkedTitle: visible ? undefined : welcomeTitle(),
      });
      return visible;
    };

    const flushWelcomes = () => {
      timers.delete(welcomeTimer);
      welcomeTimer = undefined;
      const shown = [...welcomeBatch]
        .filter(([event, room]) => addWelcome(event, room))
        .map(([, room]) => room.roomId);
      welcomeBatch.clear();
      showWelcomes(shown);
    };

    const showAsk = (event: MatrixEvent, room: Room, kind: ToastKind) => {
      const eventId = event.getId();
      // Checked here rather than on arrival: a room joined moments ago is
      // listed only once the room list refetch lands.
      const waldurRoom = waldurRoomsRef.current.get(room.roomId);
      if (!eventId || !waldurRoom) return;
      // isBotUser goes by the default localpart, which operators can change.
      if (event.getSender() === waldurRoom.bot_user_id) return;
      if (event.isRedacted() || room.hasUserReadEvent(userId, eventId)) return;
      // The level may have changed while the event waited for its key or
      // the delay.
      const level = getRoomNotificationLevel(client, room.roomId);
      if (!levelAllows(level, kind !== 'message')) return;
      const prev = asks.get(room.roomId);
      const ask: RoomAsks = {
        count: prev?.count ?? 0,
        messages: prev?.messages ?? 0,
        lastEventId: eventId,
        askTitle: prev?.askTitle,
      };
      const name = senderName(event, waldurRoom);
      let title: string;
      if (kind === 'message') {
        ask.messages += 1;
        title = ask.askTitle ?? messageTitle(name, ask.messages);
      } else {
        ask.count += 1;
        title = ask.askTitle = askTitle(kind, name, ask.count);
      }
      if (document.visibilityState === 'visible') {
        asks.set(room.roomId, ask);
        showToast(room.roomId, title);
      } else {
        asks.set(room.roomId, { ...ask, parkedTitle: title });
      }
    };

    const scheduleAsk = (
      event: MatrixEvent,
      room: Room,
      level: RoomNotificationLevel,
    ) => {
      const kind: ToastKind | null =
        getAskKind(client, event, userId) ??
        (level === 'all' && isNewMessage(event, userId) ? 'message' : null);
      if (!kind) return;
      const timer = setTimeout(() => {
        timers.delete(timer);
        showAsk(event, room, kind);
      }, ASK_DELAY_MS);
      timers.add(timer);
    };

    // Without waitMs, until the key arrives or the connection ends.
    const awaitDecryption = (
      event: MatrixEvent,
      waitMs: number | undefined,
      onReady: () => void,
    ) => {
      const stopWaiting = () => {
        clearTimeout(expiry);
        timers.delete(expiry);
        awaitingDecryption.delete(event);
        event.removeListener('Event.decrypted' as any, onDecrypted);
      };
      const onDecrypted = () => {
        if (isUndecrypted(event)) return;
        stopWaiting();
        onReady();
      };
      const expiry =
        waitMs === undefined ? undefined : setTimeout(stopWaiting, waitMs);
      if (expiry) timers.add(expiry);
      awaitingDecryption.set(event, onDecrypted);
      event.on('Event.decrypted' as any, onDecrypted);
    };

    // The welcome skips the age cap and the initial sync rule: it tells a
    // member about a chat however long ago the chat started.
    const considerWelcome = (event: MatrixEvent, room: Room) => {
      const eventId = event.getId();
      if (!eventId || welcomed.has(eventId)) return;
      if (welcomeBatch.has(event) || awaitingDecryption.has(event)) return;
      if (isUndecrypted(event)) {
        // A key restored from backup after the login can take a while.
        awaitDecryption(event, undefined, () => considerWelcome(event, room));
        return;
      }
      const botUserId = waldurRoomsRef.current.get(room.roomId)?.bot_user_id;
      if (!isWelcome(event, botUserId, userId)) return;
      welcomeBatch.set(event, room);
      if (!welcomeTimer) {
        welcomeTimer = setTimeout(flushWelcomes, ASK_DELAY_MS);
        timers.add(welcomeTimer);
      }
    };

    // After the login, and for a room listed only after its events arrived.
    const scanWelcomes = () => {
      if (!client.isInitialSyncComplete()) return;
      waldurRoomsRef.current.forEach((waldurRoom, roomId) => {
        const room = client.getRoom(roomId);
        if (!room) return;
        room
          .getLiveTimeline()
          .getEvents()
          .filter((event) => event.getSender() === waldurRoom.bot_user_id)
          .forEach((event) => considerWelcome(event, room));
      });
    };
    scanWelcomesRef.current = scanWelcomes;

    const onTimeline = (
      event: MatrixEvent,
      room: Room | undefined,
      toStartOfTimeline: boolean | undefined,
      removed: boolean,
      data: IRoomTimelineData,
    ) => {
      // The initial sync, and the catch-up after a sync error, replay history
      // as live events.
      if (!client.isInitialSyncComplete()) return;
      if (!room || toStartOfTimeline || removed || !data?.liveEvent) return;
      const level = getRoomNotificationLevel(client, room.roomId);
      if (level === 'mute') return;
      const botUserId = waldurRoomsRef.current.get(room.roomId)?.bot_user_id;
      if (event.getSender() === botUserId) {
        considerWelcome(event, room);
        return;
      }
      // Server-relative, so a client clock that is off does not matter.
      if (event.getLocalAge() > ASK_MAX_EVENT_AGE_MS) return;
      // Rooms are encrypted: the mention is only visible once decrypted.
      if (isUndecrypted(event)) {
        // A key that arrives later than this is for an ask too old to toast.
        awaitDecryption(event, ASK_MAX_EVENT_AGE_MS - event.getLocalAge(), () =>
          // The room may have been listed while the key was on its way.
          event.getSender() ===
          waldurRoomsRef.current.get(room.roomId)?.bot_user_id
            ? considerWelcome(event, room)
            : scheduleAsk(event, room, level),
        );
      } else {
        scheduleAsk(event, room, level);
      }
    };

    const clearAsk = (roomId: string) => {
      asks.delete(roomId);
      dismiss(askToastId(roomId));
      // Only while it is open: an update would bring back a closed toast.
      if (
        summaryRooms.delete(roomId) &&
        isToastOpen(WELCOME_SUMMARY_TOAST_ID)
      ) {
        if (summaryRooms.size) showWelcomeSummary();
        else dismiss(WELCOME_SUMMARY_TOAST_ID);
      }
    };

    const onReceipt = (_event: MatrixEvent, room: Room) => {
      const ask = asks.get(room.roomId);
      if (!ask) return;
      // A gappy sync resets the live timeline, after which the ask's read
      // state can no longer be told.
      if (!room.findEventById(ask.lastEventId)) {
        asks.delete(room.roomId);
      } else if (room.hasUserReadEvent(userId, ask.lastEventId)) {
        clearAsk(room.roomId);
      }
    };

    const onRedaction = (redaction: MatrixEvent, room: Room) => {
      const ask = asks.get(room.roomId);
      if (ask && redaction.getAssociatedId() === ask.lastEventId) {
        clearAsk(room.roomId);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const welcomes: string[] = [];
      asks.forEach((ask, roomId) => {
        const title = ask.parkedTitle;
        if (!title) return;
        const room = client.getRoom(roomId);
        if (
          room?.findEventById(ask.lastEventId) &&
          !room.hasUserReadEvent(userId, ask.lastEventId) &&
          levelAllows(
            getRoomNotificationLevel(client, roomId),
            ask.count > 0 || Boolean(ask.welcome),
          )
        ) {
          ask.parkedTitle = undefined;
          if (ask.welcome) welcomes.push(roomId);
          else showToast(roomId, title);
        } else {
          asks.delete(roomId);
        }
      });
      showWelcomes(welcomes);
    };

    // Push rules arrive as global account data: muting a room closes its
    // toast.
    const onAccountData = () => {
      asks.forEach((_ask, roomId) => {
        if (getRoomNotificationLevel(client, roomId) === 'mute') {
          clearAsk(roomId);
        }
      });
    };

    client.on('Room.timeline' as any, onTimeline);
    client.on('Room.receipt' as any, onReceipt);
    client.on('Room.redaction' as any, onRedaction);
    client.on('accountData' as any, onAccountData);
    document.addEventListener('visibilitychange', onVisibilityChange);
    // The tab may have turned visible while disconnected, with no listener.
    onVisibilityChange();
    return () => {
      scanWelcomesRef.current = null;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      client.removeListener('Room.timeline' as any, onTimeline);
      client.removeListener('Room.receipt' as any, onReceipt);
      client.removeListener('Room.redaction' as any, onRedaction);
      client.removeListener('accountData' as any, onAccountData);
      timers.forEach(clearTimeout);
      awaitingDecryption.forEach((onDecrypted, event) =>
        event.removeListener('Event.decrypted' as any, onDecrypted),
      );
    };
  }, [client, connected, userId, openDrawer]);

  // The rooms are listed only after the sync, and a room joined since only
  // after its events arrived.
  useEffect(() => {
    scanWelcomesRef.current?.();
  }, [waldurRooms, client, connected, userId]);

  return null;
};
