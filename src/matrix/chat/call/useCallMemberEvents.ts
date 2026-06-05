import { MatrixEvent, RoomStateEvent } from 'matrix-js-sdk';
import { useCallback, useEffect, useState } from 'react';

import { useMatrixClient } from '../useMatrixClient';
import { useRoomMemberNames } from '../useRoomMemberNames';
import { resolveMemberName } from '../utils';

import { parseCallMembers } from './parseCallMembers';
import { CallMemberInfo } from './types';

const CALL_MEMBER_EVENT = 'org.matrix.msc3401.call.member';
// Short expiry + periodic refresh (see CALL_MEMBER_REFRESH_MS) so a crashed
// or closed tab stops showing as "in call" within ~30s instead of an hour.
const MEMBERSHIP_EXPIRY_MS = 30 * 1000;
export const CALL_MEMBER_REFRESH_MS = 10 * 1000;

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

function getDeviceId(): string {
  return sessionStorage.getItem(DEVICE_ID_KEY) || '';
}

export const useCallMemberEvents = (
  roomId: string | null,
  roomUuid: string | null,
) => {
  const { client } = useMatrixClient();
  const memberNames = useRoomMemberNames(roomUuid);
  const [callMembers, setCallMembers] = useState<CallMemberInfo[]>([]);

  const refresh = useCallback(() => {
    if (!client || !roomId) {
      setCallMembers([]);
      return;
    }
    const room = client.getRoom(roomId);
    if (!room) {
      setCallMembers([]);
      return;
    }
    const raw = parseCallMembers(room, Date.now());
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

  const isOtherMemberInCall = useCallback(() => {
    const myUserId = client?.getUserId();
    const myDeviceId = getDeviceId();
    return callMembers.some(
      (m) => m.userId !== myUserId || m.deviceId !== myDeviceId,
    );
  }, [client, callMembers]);

  return { callMembers, isOtherMemberInCall };
};

// The call lives in a specific room; tying the announce target to whatever
// room the user is currently viewing breaks as soon as they switch rooms
// mid-call. These helpers take the target room explicitly.
export async function announceCallJoin(
  client: any,
  roomId: string,
  deviceId: string,
): Promise<void> {
  if (!client || !roomId) return;
  await client.sendStateEvent(
    roomId,
    CALL_MEMBER_EVENT,
    {
      memberships: [
        {
          application: 'org.matrix.msc3401.call',
          call_id: '',
          device_id: deviceId,
          expires: MEMBERSHIP_EXPIRY_MS,
          created_ts: Date.now(),
          foci_active: [{ type: 'livekit' }],
        },
      ],
    },
    client.getUserId() || undefined,
  );
}

export async function announceCallLeave(
  client: any,
  roomId: string,
): Promise<void> {
  if (!client || !roomId) return;
  try {
    await client.sendStateEvent(
      roomId,
      CALL_MEMBER_EVENT,
      { memberships: [] },
      client.getUserId() || undefined,
    );
  } catch {
    // Best effort — tab may be closing
  }
}
