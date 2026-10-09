import { MatrixEvent, RoomStateEvent } from 'matrix-js-sdk';
import { useCallback, useEffect, useState } from 'react';

import { useMatrixClient } from '../useMatrixClient';
import { useRoomMemberNames } from '../useRoomMemberNames';
import { resolveMemberName } from '../utils';

import {
  CALL_MEMBER_EVENT,
  CallMembershipTiming,
  getCallDeviceId,
  LiveKitFocus,
  makeCallMemberStateKey,
  makeCallMembershipContent,
  timerDelay,
} from './callMembership';
import { parseCallMembers } from './parseCallMembers';
import { CallMemberInfo } from './types';

export const useCallMemberEvents = (
  roomId: string | null,
  roomUuid: string | null,
) => {
  const { client } = useMatrixClient();
  const memberNames = useRoomMemberNames(roomUuid);
  const [callMembers, setCallMembers] = useState<CallMemberInfo[]>([]);
  const [nextExpiry, setNextExpiry] = useState<number | null>(null);

  const refresh = useCallback(() => {
    if (!client || !roomId) {
      setCallMembers([]);
      setNextExpiry(null);
      return;
    }
    const room = client.getRoom(roomId);
    if (!room) {
      setCallMembers([]);
      setNextExpiry(null);
      return;
    }
    const raw = parseCallMembers(room, Date.now());
    setNextExpiry(raw.length ? Math.min(...raw.map((r) => r.expiresAt)) : null);
    setCallMembers(
      raw.map((r) => ({
        ...r,
        displayName: resolveMemberName(
          r.userId,
          memberNames,
          room.getMember(r.userId)?.name,
        ),
      })),
    );
  }, [client, roomId, memberNames]);

  useEffect(() => {
    if (!client || !roomId) return;

    refresh();

    // RoomStateEvent.Events is global across rooms — filter to the watched
    // room and the call membership event type so unrelated state churn (other
    // rooms, name/topic changes, etc.) doesn't re-render the call view and
    // thrash LiveKit's effects.
    const handler = (event: MatrixEvent) => {
      if (
        event.getRoomId() === roomId &&
        event.getType() === CALL_MEMBER_EVENT
      ) {
        refresh();
      }
    };
    client.on(RoomStateEvent.Events, handler);

    return () => {
      client.removeListener(RoomStateEvent.Events, handler);
    };
  }, [client, roomId, refresh]);

  // A device that crashed never sends its leave, so its membership only ends
  // by expiring. Nothing arrives at that moment; re-read the state then.
  useEffect(() => {
    if (nextExpiry === null) return;
    const timer = setTimeout(
      refresh,
      timerDelay(nextExpiry - Date.now() + 100),
    );
    return () => clearTimeout(timer);
  }, [nextExpiry, refresh]);

  const isOtherMemberInCall = useCallback(() => {
    const myUserId = client?.getUserId();
    const myDeviceId = getCallDeviceId(client);
    return callMembers.some(
      (m) => m.userId !== myUserId || m.deviceId !== myDeviceId,
    );
  }, [client, callMembers]);

  return { callMembers, isOtherMemberInCall };
};

// The call lives in a specific room; tying the announce target to whatever
// room the user is currently viewing breaks as soon as they switch rooms
// mid-call. These helpers take the target room explicitly.
export function getCallMemberStateKey(
  client: any,
  roomId: string,
  deviceId: string,
): string {
  return makeCallMemberStateKey(
    client.getUserId() || '',
    deviceId,
    client.getRoom?.(roomId)?.getVersion?.() || '',
  );
}

export async function announceCallJoin(
  client: any,
  roomId: string,
  deviceId: string,
  timing: CallMembershipTiming,
  foci: LiveKitFocus[] = [],
): Promise<void> {
  if (!client || !roomId) return;
  await client.sendStateEvent(
    roomId,
    CALL_MEMBER_EVENT,
    makeCallMembershipContent(client.getUserId() || '', deviceId, timing, foci),
    getCallMemberStateKey(client, roomId, deviceId),
  );
}

export async function announceCallLeave(
  client: any,
  roomId: string,
  deviceId: string,
): Promise<void> {
  if (!client || !roomId) return;
  try {
    await client.sendStateEvent(
      roomId,
      CALL_MEMBER_EVENT,
      {},
      getCallMemberStateKey(client, roomId, deviceId),
    );
  } catch {
    // Best effort — tab may be closing
  }
}
