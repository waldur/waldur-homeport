import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { matrixRoomsList } from 'waldur-js-client';

export function useMatrixRooms(projectUuid?: string) {
  const filter = useMemo(() => ({ scope_uuid: projectUuid }), [projectUuid]);

  return useQuery({
    queryKey: ['matrixRooms', projectUuid],
    queryFn: () =>
      matrixRoomsList({ query: filter as any }).then((r) => r.data),
    enabled: !!projectUuid,
  });
}
