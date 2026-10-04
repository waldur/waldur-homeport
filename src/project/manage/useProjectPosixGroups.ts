import { QueryClient, useQuery } from '@tanstack/react-query';
import { marketplaceProjectPosixGroupsList } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { OWN_ERROR_STATE, retryServerErrors } from '@/core/queryRetry';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

const projectPosixGroupsQuery = (projectUuid: string) => ({
  queryKey: ['project-posix-groups', projectUuid],
  queryFn: async () => {
    const response = await marketplaceProjectPosixGroupsList({
      query: { project_uuid: projectUuid },
    });
    return response.data;
  },
  staleTime: STALE_TIME,
  // One retry, so a failing server soon shows the error instead of a spinner;
  // the tab and the overview show it themselves, so no redirect.
  retry: retryServerErrors(1),
  meta: OWN_ERROR_STATE,
});

/** Whether the project views show POSIX groups at all. */
export const isProjectPosixGroupsVisible = () =>
  isFeatureVisible(MarketplaceFeatures.show_posix_id_pools);

/** The project's POSIX groups; not requested where POSIX identities are off. */
export const useProjectPosixGroups = (projectUuid: string) =>
  useQuery({
    ...projectPosixGroupsQuery(projectUuid),
    enabled: Boolean(projectUuid) && isProjectPosixGroupsVisible(),
  });

/** The same rollup for a table, sharing the cached response. */
export const fetchProjectPosixGroups = (
  queryClient: QueryClient,
  projectUuid: string,
) => queryClient.fetchQuery(projectPosixGroupsQuery(projectUuid));
