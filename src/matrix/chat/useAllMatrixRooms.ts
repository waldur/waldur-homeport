import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { matrixRoomsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { useUser } from '@/workspace/hooks';

import {
  RoomCallState,
  useAllRoomCallStates,
} from './call/useAllRoomCallStates';
import { isRoomMuted } from './mute';
import { classifyPreviewEvent, PreviewKind } from './previewClassifier';
import { useMatrixClient } from './useMatrixClient';
import { useAllRoomMemberNames } from './useRoomMemberNames';
import { resolveMemberName } from './utils';

// Mirrors get_members[:10] in waldur-mastermind's MatrixRoomSerializer: the room
// list embeds at most this many members. Rooms above it need their full roster
// fetched so preview senders outside the embedded slice still resolve to the
// canonical Waldur name instead of a Matrix-controlled one.
const EMBEDDED_MEMBER_CAP = 10;

/** Live, SDK-derived state for a room — not available from the REST API. */
interface RoomLiveState {
  unreadCount: number;
  mentionCount: number;
  /** Flat text preview, kept for tooltips and the collapsed rail. */
  preview: string;
  /** Structured kind so the row can render an icon/size for media & system lines. */
  previewKind: PreviewKind;
  previewFileName?: string;
  previewFileSize?: number;
  previewSender: string;
  lastActivity: number;
  isMuted: boolean;
}

// Event types that can surface as a conversation-list preview. Anything else
// (topic/name/avatar churn, redactions) is skipped so the row keeps showing the
// last meaningful line.
const PREVIEWABLE_EVENT_TYPES = new Set(['m.room.message', 'm.room.member']);

interface RoomLiveMap {
  [roomId: string]: RoomLiveState;
}

/** Pull unread counts and the last message straight from the Matrix client. */
function readRoomLiveState(
  client: any,
  room: any,
  ownUserId: string | null,
  ownName: string,
  memberNames: Map<string, string>,
): RoomLiveState {
  const unreadCount =
    room.getUnreadNotificationCount?.('total') ??
    room.notificationCounts?.total ??
    0;
  const mentionCount =
    room.getUnreadNotificationCount?.('highlight') ??
    room.notificationCounts?.highlight ??
    0;

  let preview = '';
  let previewKind: PreviewKind = 'none';
  let previewFileName: string | undefined;
  let previewFileSize: number | undefined;
  let previewSender = '';
  let lastActivity = 0;

  const events = room.getLiveTimeline?.()?.getEvents?.() ?? [];
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    const type = event.getType?.();
    if (!PREVIEWABLE_EVENT_TYPES.has(type)) continue;
    const content = event.getContent?.() ?? {};

    // Member events are state events: the affected user is the state key, and
    // the prior membership lives in prev_content. Resolve the target to the
    // canonical Waldur name so the system line reads "Invited Alisa Hester …".
    const targetId =
      type === 'm.room.member' ? event.getStateKey?.() : undefined;
    const targetName = targetId
      ? resolveMemberName(
          targetId,
          memberNames,
          room.getMember?.(targetId)?.name,
        )
      : undefined;
    const info = classifyPreviewEvent(type, content, {
      prevMembership: event.getPrevContent?.()?.membership,
      targetName,
    });
    if (info.kind === 'none') continue;

    preview = info.text;
    previewKind = info.kind;
    previewFileName = info.fileName;
    previewFileSize = info.fileSize;
    const senderId = event.getSender?.() ?? '';
    // System lines already name the actor; only message previews carry a
    // "Sender: " prefix in the row.
    previewSender =
      info.kind === 'system'
        ? ''
        : senderId && senderId === ownUserId
          ? ownName
          : resolveMemberName(
              senderId,
              memberNames,
              room.getMember?.(senderId)?.name,
            );
    lastActivity = event.getTs?.() ?? 0;
    break;
  }

  return {
    unreadCount,
    mentionCount,
    preview,
    previewKind,
    previewFileName,
    previewFileSize,
    previewSender,
    lastActivity,
    isMuted: isRoomMuted(client, room.roomId),
  };
}

export function useAllMatrixRooms() {
  const { client, connectionState } = useMatrixClient();
  const currentUser = useUser();
  const [liveMap, setLiveMap] = useState<RoomLiveMap>({});

  const query = useQuery({
    queryKey: ['matrixRoomsAll'],
    // Restrict to rooms the current user belongs to. Unlike the admin rooms
    // view, the chat list is personal — staff/support must not see rooms they
    // are not a member of.
    queryFn: () =>
      matrixRoomsList({ query: { member: true } as any }).then((r) => r.data),
    // Gate on an authenticated user, mirroring useMatrixAutoConnect's observer
    // of this same shared query key. Without it this observer keeps the query
    // enabled during the OIDC login transition, so an anonymous /matrix/rooms/
    // request fires; its 401 lands after the exchanged token is stored and the
    // global interceptor mistakes it for an expired session and logs the user
    // straight back out.
    enabled: isMatrixChatEnabled() && Boolean(currentUser?.uuid),
  });

  // Preview sender names: small rooms are covered by the members embedded in
  // the room list response (no extra request). Rooms larger than the embedded
  // cap fetch their full roster so an out-of-slice sender still resolves to the
  // canonical Waldur name.
  const embeddedNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const room of query.data ?? []) {
      for (const m of room.members ?? []) {
        if (m.matrix_user_id && m.user_full_name) {
          map.set(m.matrix_user_id, m.user_full_name);
        }
      }
    }
    return map;
  }, [query.data]);

  const bigRoomUuids = useMemo(
    () =>
      (query.data ?? [])
        .filter((r) => r.members_count > EMBEDDED_MEMBER_CAP)
        .map((r) => r.uuid),
    [query.data],
  );
  const fetchedNames = useAllRoomMemberNames(bigRoomUuids);

  const memberNames = useMemo(() => {
    if (fetchedNames.size === 0) return embeddedNames;
    const map = new Map(embeddedNames);
    for (const [id, name] of fetchedNames) {
      map.set(id, name);
    }
    return map;
  }, [embeddedNames, fetchedNames]);

  const matrixRoomIds = useMemo(
    () =>
      (query.data ?? [])
        .map((r) => (r as any).room_id as string | undefined)
        .filter((id): id is string => Boolean(id)),
    [query.data],
  );
  const callStates = useAllRoomCallStates(matrixRoomIds);

  const readRoom = useCallback(
    (room: any): RoomLiveState | null => {
      if (!client || connectionState !== 'connected') return null;
      const ownUserId = client.getUserId();
      const ownName = currentUser?.full_name?.trim() || translate('You');
      return readRoomLiveState(client, room, ownUserId, ownName, memberNames);
    },
    [client, connectionState, currentUser?.full_name, memberNames],
  );

  const refreshLiveState = useCallback(() => {
    if (!client || connectionState !== 'connected') return;
    const map: RoomLiveMap = {};
    for (const room of client.getRooms()) {
      const live = readRoom(room);
      if (live) map[room.roomId] = live;
    }
    setLiveMap(map);
  }, [client, connectionState, readRoom]);

  useEffect(() => {
    if (!client || connectionState !== 'connected') return;

    refreshLiveState();

    // Room.timeline / Room.receipt pass the affected room — patch just that
    // entry instead of re-scanning every room's full timeline per event.
    const onRoomEvent = (_event: any, room: any) => {
      if (!room) {
        refreshLiveState();
        return;
      }
      const live = readRoom(room);
      if (live) {
        setLiveMap((prev) => ({ ...prev, [room.roomId]: live }));
      }
    };
    // accountData (e.g. push-rule/mute changes) is global — full refresh.
    const onAccountData = () => refreshLiveState();

    client.on('Room.timeline' as any, onRoomEvent);
    client.on('Room.receipt' as any, onRoomEvent);
    client.on('accountData' as any, onAccountData);

    return () => {
      client.removeListener('Room.timeline' as any, onRoomEvent);
      client.removeListener('Room.receipt' as any, onRoomEvent);
      client.removeListener('accountData' as any, onAccountData);
    };
  }, [client, connectionState, refreshLiveState, readRoom]);

  // The initial sync only loads the last 30 timeline events per room. Rooms
  // with high state-event traffic (call announces, member churn) can fill that
  // window with no `m.room.message`, leaving the history list with no preview.
  // Paginate older events on first connect until at least one message surfaces.
  const previewBackfilled = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!client || connectionState !== 'connected') return;
    let cancelled = false;

    const backfill = async (room: any) => {
      if (previewBackfilled.current.has(room.roomId)) return;
      previewBackfilled.current.add(room.roomId);
      const MAX_ROUNDS = 5;
      const PAGE_SIZE = 100;
      for (let i = 0; i < MAX_ROUNDS; i++) {
        if (cancelled) return;
        const events = room.getLiveTimeline?.()?.getEvents?.() ?? [];
        if (events.some((e: any) => e.getType?.() === 'm.room.message')) return;
        const before = events.length;
        try {
          await client.scrollback(room, PAGE_SIZE);
        } catch {
          return;
        }
        const after = room.getLiveTimeline?.()?.getEvents?.().length ?? 0;
        if (after === before) return;
      }
    };

    // Cap concurrent backfills so an account with many rooms doesn't fire a
    // burst of /messages calls in one tick — Synapse/Tuwunel rate-limit and
    // partial backfills silently drop under pressure. Three workers pulling
    // from a shared queue keeps the homeserver happy without serializing all
    // history fetches behind one another.
    const BACKFILL_CONCURRENCY = 3;
    const queue = client.getRooms().slice();
    const worker = async () => {
      while (queue.length > 0 && !cancelled) {
        const room = queue.shift();
        if (!room) return;
        await backfill(room);
      }
    };
    void Promise.allSettled(
      Array.from({ length: BACKFILL_CONCURRENCY }, worker),
    );

    return () => {
      cancelled = true;
    };
  }, [client, connectionState, query.data]);

  // Enrich REST rooms with live SDK state. Memoised so downstream consumers
  // (MatrixChatPanel, MatrixRoomList) don't see a new reference each render,
  // which would churn their useMemo/useEffect deps.
  const enrichedRooms = useMemo(() => {
    const rooms = query.data ?? [];
    return rooms.map((room) => {
      const roomId = (room as any).room_id as string | undefined;
      const live = roomId ? liveMap[roomId] : undefined;
      const activeCall: RoomCallState | null =
        (roomId && callStates.get(roomId)) || null;
      return {
        ...room,
        unreadCount: live?.unreadCount ?? 0,
        mentionCount: live?.mentionCount ?? 0,
        preview: live?.preview ?? '',
        previewKind: live?.previewKind ?? ('none' as PreviewKind),
        previewFileName: live?.previewFileName,
        previewFileSize: live?.previewFileSize,
        previewSender: live?.previewSender ?? '',
        lastActivity: live?.lastActivity ?? 0,
        isMuted: live?.isMuted ?? false,
        activeCall,
      };
    });
  }, [query.data, liveMap, callStates]);

  const totalUnread = useMemo(
    () => enrichedRooms.reduce((sum, r) => sum + r.unreadCount, 0),
    [enrichedRooms],
  );

  return {
    rooms: enrichedRooms,
    totalUnread,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
