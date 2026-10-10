import { useMemo } from 'react';

import { MentionCandidate } from './messageContent';
import { useMatrixClient } from './useMatrixClient';
import { useRoomMemberNames } from './useRoomMemberNames';
import { isBotUser, resolveMemberName } from './utils';

/** The active room's members who can be @-mentioned, by display name. */
export function useMentionCandidates(): MentionCandidate[] {
  const { client, activeRoomId, activeRoomUuid, userId } = useMatrixClient();
  const memberNames = useRoomMemberNames(activeRoomUuid);
  return useMemo(() => {
    if (!client || !activeRoomId) return [];
    const room = client.getRoom(activeRoomId);
    if (!room) return [];
    return (
      room
        .getJoinedMembers()
        .map((m: any) => ({
          userId: m.userId as string,
          displayName: resolveMemberName(m.userId, memberNames, m.name),
        }))
        // Exclude self and the appservice bot — the bot isn't a mentionable user.
        .filter(
          (m: MentionCandidate) => m.userId !== userId && !isBotUser(m.userId),
        )
        .sort((a: MentionCandidate, b: MentionCandidate) =>
          a.displayName.localeCompare(b.displayName),
        )
    );
  }, [client, activeRoomId, userId, memberNames]);
}
