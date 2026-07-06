import { useQuery } from '@tanstack/react-query';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

export const useProjectPosixGroups = (projectUuid: string) =>
  useQuery({
    queryKey: ['project-posix-groups', projectUuid],
    queryFn: async () => {
      const response = await marketplaceProjectPosixGroupsList({
        query: { project_uuid: projectUuid },
      });
      return response.data;
    },
    staleTime: STALE_TIME,
    enabled: Boolean(projectUuid),
  });
