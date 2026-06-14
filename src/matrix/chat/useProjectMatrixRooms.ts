import { useQuery } from '@tanstack/react-query';
import { MatrixRoom, matrixRoomsList } from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { isMatrixChatEnabled } from '@/matrix/utils';

export const projectMatrixRoomsKey = (projectUuid?: string) =>
  ['projectMatrixRooms', projectUuid] as const;

export const fetchProjectMatrixRooms = (
  projectUuid: string,
): Promise<MatrixRoom[]> =>
  matrixRoomsList({ query: { project_uuid: projectUuid } }).then(
    (r) => r.data ?? [],
  );

export function useProjectMatrixRooms(projectUuid?: string) {
  return useQuery({
    queryKey: projectMatrixRoomsKey(projectUuid),
    queryFn: () => fetchProjectMatrixRooms(projectUuid!),
    enabled: !!projectUuid && isMatrixChatEnabled(),
  });
}

export const hasActiveMatrixRoom = (rooms: MatrixRoom[] | undefined): boolean =>
  Boolean(rooms?.some((r) => r.state === 'active'));

// Sync read for non-React call sites (e.g. UI-Router permission predicates).
// A cold cache reads as "no active room" rather than blocking the route.
export const hasActiveProjectMatrixRoomInCache = (
  projectUuid?: string,
): boolean => {
  if (!projectUuid) return false;
  return hasActiveMatrixRoom(
    queryClient.getQueryData<MatrixRoom[]>(projectMatrixRoomsKey(projectUuid)),
  );
};
