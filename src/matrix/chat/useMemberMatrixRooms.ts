import { useQuery } from '@tanstack/react-query';
import { matrixRoomsList } from 'waldur-js-client';

import { isMatrixChatEnabled } from '@/matrix/utils';
import { useUser } from '@/workspace/hooks';

/**
 * The Waldur rooms the current user belongs to: one shared fetch for the room
 * list, the background auto-connect and the unread badges.
 */
export function useMemberMatrixRooms() {
  const user = useUser();
  return useQuery({
    queryKey: ['matrixRoomsAll'],
    // Restrict to rooms the current user belongs to. Unlike the admin rooms
    // view, the chat list is personal — staff/support must not see rooms they
    // are not a member of.
    queryFn: () =>
      matrixRoomsList({ query: { member: true } as any }).then((r) => r.data),
    // Gate on an authenticated user. Without it an observer keeps the query
    // enabled during the OIDC login transition, so an anonymous /matrix/rooms/
    // request fires; its 401 lands after the exchanged token is stored and the
    // global interceptor mistakes it for an expired session and logs the user
    // straight back out.
    enabled: isMatrixChatEnabled() && Boolean(user?.uuid),
  });
}
