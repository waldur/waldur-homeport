import { useMatrixClient } from './useMatrixClient';
import { useMemberMatrixRooms } from './useMemberMatrixRooms';

/**
 * The Matrix user ID of Waldur's bot in the active room, as Waldur reports
 * it, or null until known. Only this sender's typed blocks are rendered: a
 * member's own name could look like a bot's.
 */
export function useRoomBotUserId(): string | null {
  const { activeRoomUuid } = useMatrixClient();
  const { data: rooms } = useMemberMatrixRooms();
  const room = rooms?.find((r) => r.uuid === activeRoomUuid);
  return room?.bot_user_id || null;
}
