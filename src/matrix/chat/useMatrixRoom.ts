import { useCallback, useEffect, useRef, useState } from 'react';

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

export function useMatrixRoom() {
  const { client, activeRoomId, activeRoomUuid, connectionState } =
    useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  // Latest name map, read inside the typing listener without re-subscribing
  // it every time the map reloads.
  const memberNamesRef = useRef(memberNames);
  memberNamesRef.current = memberNames;
  const [messages, setMessages] = useState<MatrixChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
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

  // Load initial messages from room timeline (resets state on room change)
  useEffect(() => {
    // Reset state for the new room
    setMessages([]);
    setTypingUsers([]);
    setHasOlderMessages(true);
    lastReceiptEventIdRef.current = null;

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
    const myUserId = client.getUserId() ?? '';
    const { aggregates, reactors } = aggregateReactions(timeline, myUserId);
    const mapped = (
      timeline
        .map((e) => mapEventToMessage(e, room))
        .filter(Boolean) as MatrixChatMessage[]
    ).map((msg) => ({
      ...msg,
      reactions: aggregates.get(msg.eventId),
      reactors: reactors.get(msg.eventId) ?? {},
    }));
    setMessages(mapped);
    setLoading(false);
    setLoadedRoomId(activeRoomId);
  }, [client, activeRoomId, connectionState]);

  // Subscribe to new timeline events
  useEffect(() => {
    if (!client || !activeRoomId) return;

    const onTimeline = (event: any, eventRoom: any) => {
      if (eventRoom?.roomId !== activeRoomId) return;

      // Reactions update an existing message's reactions[] rather than
      // appending a new row to the stream. Scope the recompute to the one
      // target — a full re-aggregation of the timeline per emoji turns busy
      // rooms into a frame-dropping mess.
      if (event.getType?.() === 'm.reaction') {
        const targetId = event.getContent?.()?.['m.relates_to']?.event_id;
        if (!targetId) return;
        const myUserId = client.getUserId() ?? '';
        const { reactions, reactors } = aggregateReactionsForTarget(
          eventRoom.getLiveTimeline().getEvents(),
          targetId,
          myUserId,
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.eventId === targetId ? { ...m, reactions, reactors } : m,
          ),
        );
        return;
      }

      const msg = mapEventToMessage(event, eventRoom);
      if (msg) {
        setMessages((prev) =>
          prev.some((m) => m.eventId === msg.eventId) ? prev : [...prev, msg],
        );
      }
    };

    const onTyping = (_event: any, member: any) => {
      if (member?.roomId !== activeRoomId) return;
      const room = client.getRoom(activeRoomId);
      if (!room) return;
      const typing = room
        .getMembers()
        .filter((m: any) => m.typing && m.userId !== client.getUserId())
        .map((m: any) =>
          resolveMemberName(m.userId, memberNamesRef.current, m.name),
        );
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
        const targetId =
          redactedEvent.getContent?.()?.['m.relates_to']?.event_id;
        if (!targetId) return;
        const myUserId = client.getUserId() ?? '';
        const { reactions, reactors } = aggregateReactionsForTarget(
          eventRoom.getLiveTimeline().getEvents(),
          targetId,
          myUserId,
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.eventId === targetId ? { ...m, reactions, reactors } : m,
          ),
        );
        return;
      }

      if (redactedType === 'm.room.message') {
        const remapped = mapEventToMessage(redactedEvent, eventRoom);
        setMessages((prev) =>
          prev.map((m) => {
            if (m.eventId !== redactedId) return m;
            // Preserve reactions/reactors — those are derived state and the
            // remap won't carry them. If the SDK marked the message redacted
            // and mapEventToMessage returned null, leave the row in place so
            // the timeline doesn't gap.
            return remapped
              ? { ...remapped, reactions: m.reactions, reactors: m.reactors }
              : m;
          }),
        );
      }
      // Other event types (state/membership redactions) don't affect the
      // displayed message list.
    };

    // Fires when matrix-js-sdk swaps a local-echo for the real server
    // event (after the homeserver ack). Without this, my own reactions
    // would never capture their real event_id and `unreact` couldn't
    // redact them.
    const onLocalEchoUpdated = (event: any, eventRoom: any) => {
      if (eventRoom?.roomId !== activeRoomId) return;
      if (event?.getType?.() !== 'm.reaction') return;
      const targetId = event.getContent?.()?.['m.relates_to']?.event_id;
      if (!targetId) return;
      const myUserId = client.getUserId() ?? '';
      const { reactions, reactors } = aggregateReactionsForTarget(
        eventRoom.getLiveTimeline().getEvents(),
        targetId,
        myUserId,
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.eventId === targetId ? { ...m, reactions, reactors } : m,
        ),
      );
    };

    client.on('Room.timeline' as any, onTimeline);
    client.on('Room.redaction' as any, onRedaction);
    client.on('Room.localEchoUpdated' as any, onLocalEchoUpdated);
    client.on('RoomMember.typing' as any, onTyping);

    return () => {
      client.removeListener('Room.timeline' as any, onTimeline);
      client.removeListener('Room.redaction' as any, onRedaction);
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
      const myUserId = client.getUserId() ?? '';
      const { aggregates, reactors } = aggregateReactions(timeline, myUserId);
      const mapped = (
        timeline
          .map((e) => mapEventToMessage(e, room))
          .filter(Boolean) as MatrixChatMessage[]
      ).map((msg) => ({
        ...msg,
        reactions: aggregates.get(msg.eventId),
        reactors: reactors.get(msg.eventId) ?? {},
      }));
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
