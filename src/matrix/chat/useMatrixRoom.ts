import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getReplacedEventId,
  getRoomEvents,
  indexEdits,
} from './messageRelations';
import { sendRoomReadReceipt } from './readReceipts';
import { MatrixChatMessage } from './types';
import { useMatrixClient } from './useMatrixClient';
import { useRoomMemberNames } from './useRoomMemberNames';
import {
  aggregateReactions,
  aggregateReactionsForTarget,
  mapEventToMessage,
  resolveMemberName,
} from './utils';

/**
 * Insert or update a message in the list, reconciling an outgoing message's
 * local echo with its later remote echo. The two share a `txnId` but differ in
 * `eventId` (the local echo has a transient `~`-prefixed id), so matching on
 * either avoids appending a duplicate row when the server acks. Derived
 * reaction state is preserved across the swap.
 */
function upsertMessage(
  prev: MatrixChatMessage[],
  msg: MatrixChatMessage,
): MatrixChatMessage[] {
  const idx = prev.findIndex(
    (m) =>
      m.eventId === msg.eventId || (msg.txnId != null && m.txnId === msg.txnId),
  );
  if (idx === -1) return [...prev, msg];
  const next = prev.slice();
  next[idx] = {
    ...msg,
    reactions: prev[idx].reactions,
    reactors: prev[idx].reactors,
  };
  return next;
}

/**
 * Put a message decrypted after it reached the timeline where it belongs. A row
 * it already has (a failed decryption that later succeeded) is updated in
 * place; otherwise it goes before the first row that comes after it in the
 * room's timeline, so the list isn't regrouped by when each event finished
 * decrypting. Rows not in the timeline (local echoes) count as the newest.
 */
function placeDecryptedMessage(
  prev: MatrixChatMessage[],
  msg: MatrixChatMessage,
  timelineEvents: any[],
): MatrixChatMessage[] {
  if (
    prev.some(
      (m) =>
        m.eventId === msg.eventId ||
        (msg.txnId != null && m.txnId === msg.txnId),
    )
  ) {
    return upsertMessage(prev, msg);
  }
  const positions = new Map<string, number>();
  timelineEvents.forEach((e, i) => {
    const id = e.getId?.();
    if (id) positions.set(id, i);
  });
  const position = positions.get(msg.eventId);
  const idx = prev.findIndex((m) =>
    position === undefined
      ? m.timestamp > msg.timestamp
      : (positions.get(m.eventId) ?? Infinity) > position,
  );
  if (idx === -1) return [...prev, msg];
  return [...prev.slice(0, idx), msg, ...prev.slice(idx)];
}

function rememberReactionTargets(
  targets: Map<string, string>,
  events: any[],
): void {
  for (const event of events) {
    if (event.getType?.() !== 'm.reaction') continue;
    const targetId = event.getContent?.()?.['m.relates_to']?.event_id;
    const eventId = event.getId?.();
    if (targetId && eventId) targets.set(eventId, targetId);
  }
}

function rememberEditTargets(targets: Map<string, string>, events: any[]) {
  for (const event of events) {
    const targetId = getReplacedEventId(event);
    const eventId = event.getId?.();
    if (targetId && eventId) targets.set(eventId, targetId);
  }
}

/**
 * Map a whole timeline to message rows with their reactions. Edits are indexed
 * once rather than searched for per message. Edits known to have been deleted
 * stay hidden: redaction strips the relation that otherwise says what they
 * were, which would leave each one behind as a deleted-message row.
 */
function mapTimeline(
  timeline: any[],
  room: any,
  myUserId: string,
  editTargets: Map<string, string>,
): MatrixChatMessage[] {
  const editsIndex = indexEdits(getRoomEvents(room));
  const { aggregates, reactors } = aggregateReactions(timeline, myUserId);
  return (
    timeline
      .filter((e) => !editTargets.has(e.getId?.()))
      .map((e) => mapEventToMessage(e, room, editsIndex))
      .filter(Boolean) as MatrixChatMessage[]
  ).map((msg) => ({
    ...msg,
    reactions: aggregates.get(msg.eventId),
    reactors: reactors.get(msg.eventId) ?? {},
  }));
}

export function useMatrixRoom() {
  const { client, activeRoomId, activeRoomUuid, connectionState } =
    useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  // Latest name map, read inside the typing listener without re-subscribing
  // it every time the map reloads.
  const memberNamesRef = useRef(memberNames);
  memberNamesRef.current = memberNames;
  const [messages, setMessages] = useState<MatrixChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  // Which room `messages` currently holds — guards against rendering a
  // previous room's history while activeRoomId has already moved on.
  const [loadedRoomId, setLoadedRoomId] = useState<string | null>(null);
  // Latest activeRoomId for closure-safe checks inside long-running awaits.
  const activeRoomIdRef = useRef<string | null>(activeRoomId);
  activeRoomIdRef.current = activeRoomId;
  // Event id of the last receipt sent — dedupes repeated mark-read triggers.
  const lastReceiptEventIdRef = useRef<string | null>(null);
  // Reaction event id → the message it annotates. By the time Room.redaction
  // fires, matrix-js-sdk has already stripped the reaction's content, so its
  // m.relates_to can no longer say which message to refresh.
  const reactionTargetsRef = useRef(new Map<string, string>());
  // Edit event id → the message it edits, for the same reason: a redacted
  // edit no longer says which message to restore.
  const editTargetsRef = useRef(new Map<string, string>());

  // Load initial messages from room timeline (resets state on room change)
  useEffect(() => {
    // Reset state for the new room
    setMessages([]);
    setTypingUsers([]);
    setHasOlderMessages(true);
    lastReceiptEventIdRef.current = null;
    reactionTargetsRef.current = new Map();
    editTargetsRef.current = new Map();

    if (!client || !activeRoomId || connectionState !== 'connected') {
      setLoading(true);
      return;
    }

    const room = client.getRoom(activeRoomId);
    if (!room) {
      setLoading(false);
      setLoadedRoomId(activeRoomId);
      return;
    }

    const timeline = room.getLiveTimeline().getEvents();
    rememberReactionTargets(reactionTargetsRef.current, timeline);
    rememberEditTargets(editTargetsRef.current, timeline);
    setMessages(
      mapTimeline(
        timeline,
        room,
        client.getUserId() ?? '',
        editTargetsRef.current,
      ),
    );
    setLoading(false);
    setLoadedRoomId(activeRoomId);
  }, [client, activeRoomId, connectionState]);

  // Subscribe to new timeline events
  useEffect(() => {
    if (!client || !activeRoomId) return;

    const refreshReactions = (eventRoom: any, targetId: string) => {
      const { reactions, reactors } = aggregateReactionsForTarget(
        eventRoom.getLiveTimeline().getEvents(),
        targetId,
        client.getUserId() ?? '',
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.eventId === targetId ? { ...m, reactions, reactors } : m,
        ),
      );
    };

    // Re-map one message row from its event: after an edit of it arrives,
    // is decrypted, sent or deleted, or after the message itself is deleted.
    // A deleted message drops its reactions along with its content.
    const refreshMessage = (eventRoom: any, eventId: string) => {
      const event = eventRoom.findEventById?.(eventId);
      if (!event) return;
      const remapped = mapEventToMessage(event, eventRoom);
      if (!remapped) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.eventId === eventId);
        if (idx === -1) return prev;
        const next = prev.slice();
        next[idx] = remapped.redacted
          ? remapped
          : {
              ...remapped,
              reactions: prev[idx].reactions,
              reactors: prev[idx].reactors,
            };
        return next;
      });
    };

    // An edit has no row of its own; it changes the message it edits.
    const applyEdit = (event: any, eventRoom: any): boolean => {
      const targetId = getReplacedEventId(event);
      if (!targetId) return false;
      rememberEditTargets(editTargetsRef.current, [event]);
      refreshMessage(eventRoom, targetId);
      return true;
    };

    const onTimeline = (event: any, eventRoom: any) => {
      if (eventRoom?.roomId !== activeRoomId) return;

      // Reactions update an existing message's reactions[] rather than
      // appending a new row to the stream. Scope the recompute to the one
      // target — a full re-aggregation of the timeline per emoji turns busy
      // rooms into a frame-dropping mess.
      if (event.getType?.() === 'm.reaction') {
        const targetId = event.getContent?.()?.['m.relates_to']?.event_id;
        if (!targetId) return;
        rememberReactionTargets(reactionTargetsRef.current, [event]);
        refreshReactions(eventRoom, targetId);
        return;
      }

      if (applyEdit(event, eventRoom)) return;

      const msg = mapEventToMessage(event, eventRoom);
      if (msg) {
        setMessages((prev) => upsertMessage(prev, msg));
      }
    };

    const onTyping = (_event: any, member: any) => {
      if (member?.roomId !== activeRoomId) return;
      const room = client.getRoom(activeRoomId);
      if (!room) return;
      const typing = room
        .getMembers()
        .filter((m: any) => m.typing && m.userId !== client.getUserId())
        .map((m: any) => ({
          userId: m.userId as string,
          name: resolveMemberName(m.userId, memberNamesRef.current, m.name),
        }));
      setTypingUsers(typing);
    };

    const onRedaction = (redactionEvent: any, eventRoom: any) => {
      if (eventRoom?.roomId !== activeRoomId) return;
      // A redaction can target a reaction (one message's aggregate changes) or
      // a regular message (its body becomes "(redacted)"). Find which, then
      // touch just that one row — re-mapping the entire list per redaction
      // allocates an object per visible message even when nothing else moved.
      const redactedId: string | undefined =
        redactionEvent?.event?.redacts ?? redactionEvent?.getAssociatedId?.();
      if (!redactedId) return;
      const redactedEvent = eventRoom.findEventById?.(redactedId);
      const redactedType = redactedEvent?.getType?.();

      if (redactedType === 'm.reaction') {
        const targetId = reactionTargetsRef.current.get(redactedId);
        if (!targetId) return;
        refreshReactions(eventRoom, targetId);
        return;
      }

      // A deleted edit gives the message back its previous text.
      const editTargetId = editTargetsRef.current.get(redactedId);
      if (editTargetId) {
        refreshMessage(eventRoom, editTargetId);
        return;
      }

      // A deleted message becomes a placeholder row, so the timeline doesn't
      // gap. Other event types (state/membership redactions) have no row.
      refreshMessage(eventRoom, redactedId);
    };

    // The homeserver rejected a redaction we had already applied locally; the
    // SDK restores the reaction, so bring its chip back.
    const onRedactionCancelled = (redactionEvent: any, eventRoom: any) => {
      if (eventRoom?.roomId !== activeRoomId) return;
      const redactedId: string | undefined = redactionEvent?.event?.redacts;
      if (!redactedId) return;
      const targetId = reactionTargetsRef.current.get(redactedId);
      if (targetId) {
        refreshReactions(eventRoom, targetId);
        return;
      }
      refreshMessage(
        eventRoom,
        editTargetsRef.current.get(redactedId) ?? redactedId,
      );
    };

    // Fires when matrix-js-sdk swaps a local-echo for the real server event
    // (after the homeserver ack). The client runs with detached pending-event
    // ordering, so outgoing messages never hit the live timeline while pending
    // — this is the only signal that surfaces my own message as an instant
    // local echo (and later captures a reaction's real event_id so `unreact`
    // can redact it).
    const onLocalEchoUpdated = (event: any, eventRoom: any) => {
      if (eventRoom?.roomId !== activeRoomId) return;

      const type = event?.getType?.();

      if (type === 'm.room.message') {
        // An edit being sent shows on its message at once, and a cancelled
        // one gives the message back its previous text.
        if (applyEdit(event, eventRoom)) return;
        // A send the user cancelled (or that permanently failed and was
        // cancelled) should not linger as a phantom row.
        if (event.status === 'cancelled') {
          const id = event.getId?.();
          const txnId = event.getTxnId?.();
          setMessages((prev) =>
            prev.filter(
              (m) => m.eventId !== id && (txnId == null || m.txnId !== txnId),
            ),
          );
          return;
        }
        const msg = mapEventToMessage(event, eventRoom);
        if (msg) setMessages((prev) => upsertMessage(prev, msg));
        return;
      }

      if (type !== 'm.reaction') return;
      const targetId = event.getContent?.()?.['m.relates_to']?.event_id;
      if (!targetId) return;
      rememberReactionTargets(reactionTargetsRef.current, [event]);
      refreshReactions(eventRoom, targetId);
    };

    // An event decrypted after it reached the timeline (failed decryptions
    // fire this too). A reaction drops any stand-in row and updates its
    // target; a message takes its timeline position rather than being
    // appended, so rows don't regroup by when decryption finished.
    const onDecrypted = (event: any) => {
      if (event?.getRoomId?.() !== activeRoomId) return;
      const eventRoom = client.getRoom(activeRoomId);
      if (!eventRoom) return;
      const id = event.getId?.();
      if (getReplacedEventId(event)) {
        setMessages((prev) => prev.filter((m) => m.eventId !== id));
        applyEdit(event, eventRoom);
        return;
      }
      if (event.getType?.() === 'm.reaction') {
        setMessages((prev) => prev.filter((m) => m.eventId !== id));
        onTimeline(event, eventRoom);
        return;
      }
      const msg = mapEventToMessage(event, eventRoom);
      if (!msg) {
        setMessages((prev) => prev.filter((m) => m.eventId !== id));
        return;
      }
      const myUserId = client.getUserId() ?? '';
      setMessages((prev) => {
        const events = eventRoom.getLiveTimeline().getEvents();
        const { reactions, reactors } = aggregateReactionsForTarget(
          events,
          msg.eventId,
          myUserId,
        );
        return placeDecryptedMessage(
          prev,
          {
            ...msg,
            reactions: reactions.length ? reactions : undefined,
            reactors,
          },
          events,
        );
      });
    };

    client.on('Room.timeline' as any, onTimeline);
    client.on('Event.decrypted' as any, onDecrypted);
    client.on('Room.redaction' as any, onRedaction);
    client.on('Room.redactionCancelled' as any, onRedactionCancelled);
    client.on('Room.localEchoUpdated' as any, onLocalEchoUpdated);
    client.on('RoomMember.typing' as any, onTyping);

    return () => {
      client.removeListener('Room.timeline' as any, onTimeline);
      client.removeListener('Event.decrypted' as any, onDecrypted);
      client.removeListener('Room.redaction' as any, onRedaction);
      client.removeListener(
        'Room.redactionCancelled' as any,
        onRedactionCancelled,
      );
      client.removeListener('Room.localEchoUpdated' as any, onLocalEchoUpdated);
      client.removeListener('RoomMember.typing' as any, onTyping);
    };
  }, [client, activeRoomId]);

  const loadOlderMessages = useCallback(async () => {
    if (!client || !activeRoomId || loadingOlder || !hasOlderMessages) return;

    const room = client.getRoom(activeRoomId);
    if (!room) return;

    const targetRoomId = activeRoomId;
    setLoadingOlder(true);
    try {
      const beforeCount = room.getLiveTimeline().getEvents().length;
      await client.scrollback(room, 30);
      // Drop the result if the user switched rooms during the await — the
      // initial-load effect for the new room is already managing its state.
      if (activeRoomIdRef.current !== targetRoomId) return;
      const timeline = room.getLiveTimeline().getEvents();
      rememberReactionTargets(reactionTargetsRef.current, timeline);
      rememberEditTargets(editTargetsRef.current, timeline);
      const mapped = mapTimeline(
        timeline,
        room,
        client.getUserId() ?? '',
        editTargetsRef.current,
      );
      // "No more history" must be detected by whether scrollback actually
      // grew the raw timeline — a page of state-only events (member joins,
      // metadata changes) yields no new displayable messages but is not a
      // signal that pagination has hit the start of the room.
      if (timeline.length === beforeCount) {
        setHasOlderMessages(false);
      }
      setMessages(mapped);
    } catch {
      if (activeRoomIdRef.current !== targetRoomId) return;
      // Scrollback may fail if we've reached the beginning
      setHasOlderMessages(false);
    } finally {
      if (activeRoomIdRef.current === targetRoomId) {
        setLoadingOlder(false);
      }
    }
  }, [client, activeRoomId, loadingOlder, hasOlderMessages]);

  // Deduped so repeated scroll/render triggers don't re-POST the same receipt.
  const markRoomRead = useCallback(
    (eventId: string) => {
      if (!client || !activeRoomId || connectionState !== 'connected') return;
      if (eventId === lastReceiptEventIdRef.current) return;
      lastReceiptEventIdRef.current = eventId;
      sendRoomReadReceipt(client, activeRoomId, eventId).catch(() => {
        // Best-effort: clear the marker so the next view retries the receipt.
        lastReceiptEventIdRef.current = null;
      });
    },
    [client, activeRoomId, connectionState],
  );

  return {
    messages,
    typingUsers,
    markRoomRead,
    // Stay "loading" until `messages` reflects the active room, so stale
    // history never flashes during a room switch.
    loading: loading || loadedRoomId !== activeRoomId,
    loadingOlder,
    hasOlderMessages,
    loadOlderMessages,
  };
}
