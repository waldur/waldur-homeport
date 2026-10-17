import { useEffect, useState } from 'react';

import { isRoomEncrypted } from '../roomEncryption';
import { useMatrixClient } from '../useMatrixClient';

import { CallAvailability, getCallAvailability } from './callAvailability';
import { useMatrixCall } from './useMatrixCall';

/**
 * Whether a call in the Matrix room would be encrypted, by the rule a call
 * itself follows (isRoomEncrypted). The state event is read as it changes;
 * crypto's memory, which takes a promise, once per room.
 */
function useRoomEncrypted(client: any, roomId: string | null): boolean {
  const room = roomId ? client?.getRoom?.(roomId) : null;
  // Keyed by room, so one room's late answer is never another's.
  const [rememberedRoomId, setRememberedRoomId] = useState<string | null>(null);
  useEffect(() => {
    if (!client || !roomId) return;
    let active = true;
    isRoomEncrypted(client, client.getRoom?.(roomId), roomId)
      .catch(() => false)
      .then((encrypted) => {
        if (active && encrypted) setRememberedRoomId(roomId);
      });
    return () => {
      active = false;
    };
  }, [client, roomId]);
  return (
    !!room?.hasEncryptionStateEvent?.() ||
    (!!roomId && rememberedRoomId === roomId)
  );
}

/** {@link getCallAvailability} for the active room (or `roomUuid`). */
export function useCallAvailability(
  roomUuid?: string | null,
): CallAvailability {
  const { rtcAvailable, callState, callRoomUuid } = useMatrixCall();
  const { client, activeRoomId, activeRoomUuid } = useMatrixClient();
  const targetUuid = roomUuid === undefined ? activeRoomUuid : roomUuid;
  // Only the active room has a Matrix room here. One the header shows ahead
  // of a room switch is not judged by the last room: every Waldur room is
  // encrypted, so until it can be read it is taken to be.
  const readableRoomId =
    targetUuid && targetUuid === activeRoomUuid ? activeRoomId : null;
  const encrypted = useRoomEncrypted(client, readableRoomId);
  const roomEncrypted = readableRoomId ? encrypted : !!targetUuid;
  return getCallAvailability({
    rtcAvailable,
    callState,
    callRoomUuid,
    roomUuid: targetUuid,
    roomEncrypted,
  });
}
