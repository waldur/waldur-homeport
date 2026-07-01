import { useMatrixClient } from './useMatrixClient';
import { useRoomMemberImages, useRoomMemberNames } from './useRoomMemberNames';
import { resolveMemberName } from './utils';

interface RoomMember {
  userId: string;
  name: string;
  /** Live Waldur profile image URL; undefined when the user has none. */
  image?: string;
  membership: string;
  powerLevel: number;
}

/**
 * Joined + invited members of the active room, sorted joined-first then by
 * power level. Names resolve to canonical Waldur full names. Shared by the
 * members list and the header's member count so both read one source.
 */
export function useRoomMembers(): RoomMember[] {
  const { client, activeRoomId, activeRoomUuid } = useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid ?? undefined);
  const memberImages = useRoomMemberImages(activeRoomUuid ?? undefined);

  if (!client || !activeRoomId) return [];

  const room = client.getRoom(activeRoomId);
  if (!room) return [];

  const powerLevels =
    (room.currentState as any)
      ?.getStateEvents?.('m.room.power_levels', '')
      ?.getContent?.()?.users ?? {};

  const allMembers = [
    ...room.getJoinedMembers(),
    ...room.getMembersWithMembership('invite'),
  ];

  return allMembers
    .map((m: any) => ({
      userId: m.userId as string,
      name: resolveMemberName(m.userId, memberNames, m.name),
      image: memberImages.get(m.userId),
      membership: m.membership as string,
      powerLevel: (powerLevels[m.userId] ?? 0) as number,
    }))
    .sort((a, b) => {
      // Joined before invited, then by power level.
      if (a.membership !== b.membership) {
        return a.membership === 'join' ? -1 : 1;
      }
      return b.powerLevel - a.powerLevel;
    });
}
