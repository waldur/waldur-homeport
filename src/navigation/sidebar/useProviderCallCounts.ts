import { useQuery } from '@tanstack/react-query';
import {
  proposalMyTasksCount,
  proposalRequestedOfferingsCount,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { useUser } from '@/workspace/hooks';

/** Counts change as work is done elsewhere: a minute old is fresh enough. */
const STALE_TIME = 60 * 1000;

/** How many of the provider's requests for offerings wait for an answer. */
export const useProviderPendingRequestsCount = (
  providerUuid: string,
): number => {
  const { data = 0 } = useQuery({
    queryKey: ['provider-pending-requests-count', providerUuid],
    queryFn: async () =>
      fetchResultCount(
        await proposalRequestedOfferingsCount({
          query: {
            provider_uuid: providerUuid,
            state: ['requested'],
            // An archived call asks nothing more of its providers.
            call_state: ['draft', 'active'],
          },
        }),
      ),
    enabled: Boolean(providerUuid),
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  return data;
};

/** How many of the user's own call tasks are about the provider's offerings. */
export const useProviderTasksCount = (providerUuid: string): number => {
  const user = useUser();
  const { data = 0 } = useQuery({
    // Under My reviews' key, so answering a task refreshes both.
    queryKey: ['my-tasks-count', user?.uuid, providerUuid],
    queryFn: async () =>
      fetchResultCount(
        await proposalMyTasksCount({ query: { provider_uuid: providerUuid } }),
      ),
    enabled: Boolean(user?.uuid && providerUuid),
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  return data;
};

export const countBadge = (count: number) => (count > 0 ? count : undefined);
