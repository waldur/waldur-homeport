import { useQueries, useQuery } from '@tanstack/react-query';

import { UI_STALE_TIME } from '@/core/constants';

import {
  isOnlyOneProjectManagerEnabled,
  projectHasActiveManager,
  projectHasActiveManagerQueryKey,
} from './onlyOneProjectManager';

export const useProjectHasActiveManager = (projectUuid?: string) => {
  const settingEnabled = isOnlyOneProjectManagerEnabled();

  return useQuery({
    queryKey: projectHasActiveManagerQueryKey(projectUuid),
    queryFn: () => projectHasActiveManager(projectUuid!),
    enabled: settingEnabled && Boolean(projectUuid),
    staleTime: UI_STALE_TIME,
  });
};

export const useProjectsActiveManagerMap = (projectUuids: string[]) => {
  const settingEnabled = isOnlyOneProjectManagerEnabled();
  const uniqueUuids = [...new Set(projectUuids.filter(Boolean))];

  const queries = useQueries({
    queries: uniqueUuids.map((uuid) => ({
      queryKey: projectHasActiveManagerQueryKey(uuid),
      queryFn: () => projectHasActiveManager(uuid),
      enabled: settingEnabled,
      staleTime: UI_STALE_TIME,
    })),
  });

  const managerMap = new Map<string, boolean>();
  uniqueUuids.forEach((uuid, index) => {
    if (queries[index].data !== undefined) {
      managerMap.set(uuid, queries[index].data);
    }
  });

  const isLoading = settingEnabled && queries.some((query) => query.isPending);

  return { managerMap, isLoading };
};
