import { useMatrixClient } from './useMatrixClient';

/**
 * Whether the user may notify everyone in the active room with `@room`:
 * receivers' clients honour it only from senders with the room's
 * `notifications.room` power level.
 */
export function useCanMentionRoom(): boolean {
  const { client, activeRoomId, userId } = useMatrixClient();
  if (!client || !activeRoomId || !userId) return false;
  return (
    client
      .getRoom(activeRoomId)
      ?.currentState.mayTriggerNotifOfType('room', userId) ?? false
  );
}
