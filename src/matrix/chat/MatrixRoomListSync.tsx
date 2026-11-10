import { useQueryClient } from '@tanstack/react-query';
import type { Room } from 'matrix-js-sdk';
import { FunctionComponent, useEffect, useRef } from 'react';

import { useMatrixClient } from './useMatrixClient';
import {
  MEMBER_MATRIX_ROOMS_QUERY_KEY,
  useMemberMatrixRooms,
} from './useMemberMatrixRooms';

// The wait before each fetch. Waldur's rows trail the Matrix side: a force-join
// can reach the client before the room's member row, and a kick before the
// member is recorded as gone.
export const ROOM_LIST_RETRY_DELAYS_MS = [0, 2000, 5000, 10000];

type Awaiting = 'join' | 'leave';

/**
 * Refetches Waldur's room list when the synced client joins a room the list
 * does not show as active yet, or leaves one it does, until the list catches
 * up. Otherwise the list only refreshes on remount or window focus, so a room
 * Waldur joined the user to stays out of the drawer and the unread count until
 * then.
 */
export const MatrixRoomListSync: FunctionComponent = () => {
  const { client, connectionState } = useMatrixClient();
  const { data: rooms } = useMemberMatrixRooms();
  const queryClient = useQueryClient();

  // Read by the retry timers, which outlive the render that started them.
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;

  useEffect(() => {
    // The first sync replays a join for every room the account is in.
    if (!client || connectionState !== 'connected') return;

    // The drawer shows only active rooms, so a row still archived from before
    // a reactivation is as good as missing.
    const isKnown = (roomId: string) =>
      Boolean(
        roomsRef.current?.some(
          (r) => r.room_id === roomId && r.state === 'active',
        ),
      );
    const isSettled = (roomId: string, awaiting: Awaiting) =>
      isKnown(roomId) === (awaiting === 'join');

    // One schedule for every room still waiting on the list: a role grant
    // joins many rooms at once, and each fetch reads the whole list anyway.
    const pending = new Map<string, Awaiting>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let step = 0;

    const schedule = (next: number) => {
      clearTimeout(timer);
      timer = undefined;
      step = next;
      const delay = ROOM_LIST_RETRY_DELAYS_MS[step];
      if (delay === undefined) {
        pending.clear();
      } else if (delay) {
        timer = setTimeout(attempt, delay);
      } else {
        attempt();
      }
    };

    const attempt = () => {
      timer = undefined;
      pending.forEach((awaiting, roomId) => {
        if (isSettled(roomId, awaiting)) pending.delete(roomId);
      });
      if (!pending.size) return;
      queryClient.invalidateQueries({
        queryKey: MEMBER_MATRIX_ROOMS_QUERY_KEY,
      });
      schedule(step + 1);
    };

    const onMyMembership = (room: Room, membership: string) => {
      if (membership !== 'join' && membership !== 'leave') return;
      const { roomId } = room;
      if (pending.get(roomId) === membership) return;
      if (isSettled(roomId, membership)) {
        pending.delete(roomId);
        return;
      }
      pending.set(roomId, membership);
      // A room arriving while the schedule runs only brings the next fetch
      // forward to the first retry. The fetch that opened the schedule is
      // already out, and the SDK can spread one sync's joins over several
      // tasks, so fetching at once for each would multiply a burst.
      if (timer === undefined) schedule(0);
      else if (step > 1) schedule(1);
    };

    client.on('Room.myMembership' as any, onMyMembership);
    return () => {
      client.removeListener('Room.myMembership' as any, onMyMembership);
      clearTimeout(timer);
    };
  }, [client, connectionState, queryClient]);

  return null;
};
