import { useQueries, useQuery } from '@tanstack/react-query';

import {
  isOnlyOneProjectManagerEnabled,
  isProjectManagerName,
  isProjectManagerRole,
  isProjectManagerSelectionBlocked,
  projectHasActiveManager,
  projectHasActiveManagerQueryKey,
} from './onlyOneProjectManager';

export const useProjectHasActiveManager = (projectUuid?: string) => {
  const settingEnabled = isOnlyOneProjectManagerEnabled();

  return useQuery({
    queryKey: projectHasActiveManagerQueryKey(projectUuid),
    queryFn: () => projectHasActiveManager(projectUuid!),
    enabled: settingEnabled && Boolean(projectUuid),
    // Gates whether the project-manager role can be selected.
    staleTime: 0,
    gcTime: 0,
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
      staleTime: 0,
      gcTime: 0,
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

/**
 * Whether the project-manager role must stay unselectable.
 * Holds the action while the check is in flight, and skips both the hold and
 * the request when the member already holds that role.
 */
export const useProjectManagerBlock = (
  projectUuid?: string,
  role?: { name?: string; template_name?: string | null } | null,
  currentRoleName?: string,
): boolean => {
  const alreadyHoldsManagerRole =
    Boolean(currentRoleName) && isProjectManagerName(currentRoleName);
  const { data: hasActiveManager, isPending } = useProjectHasActiveManager(
    alreadyHoldsManagerRole ? undefined : projectUuid,
  );
  const needsManagerCheck =
    !alreadyHoldsManagerRole &&
    isOnlyOneProjectManagerEnabled() &&
    isProjectManagerRole(role) &&
    Boolean(projectUuid);

  return (
    isProjectManagerSelectionBlocked(hasActiveManager, role, currentRoleName) ||
    (needsManagerCheck && isPending)
  );
};
