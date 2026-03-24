import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsAggregatedUsageTrendsList,
  marketplaceStatsCountActiveResourcesGroupedByOfferingList,
  marketplaceStatsCountUniqueUsersConnectedWithActiveResourcesOfServiceProviderList,
  marketplaceStatsProjectCreationTrendList,
  marketplaceStatsTopServiceProvidersByResourcesList,
  usersUserRegistrationTrendList,
} from 'waldur-js-client';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useGrowthStatistics = () => {
  return useQuery({
    queryKey: ['growthStatistics'],
    queryFn: async ({ signal }) => {
      const [
        userTrends,
        resourceTrends,
        providers,
        offerings,
        activeUsers,
        projectTrends,
      ] = await Promise.all([
        usersUserRegistrationTrendList({ signal }).then((r) => r.data || []),
        marketplaceStatsAggregatedUsageTrendsList({ signal }).then(
          (r) => r.data || [],
        ),
        marketplaceStatsTopServiceProvidersByResourcesList({
          query: { limit: 5 },
          signal,
        }).then((r) => r.data || []),
        marketplaceStatsCountActiveResourcesGroupedByOfferingList({
          query: { limit: 5 },
          signal,
        }).then((r) => r.data || []),
        marketplaceStatsCountUniqueUsersConnectedWithActiveResourcesOfServiceProviderList(
          { signal },
        ).then((r) => r.data || []),
        marketplaceStatsProjectCreationTrendList({ signal }).then(
          (r) => r.data || [],
        ),
      ]);

      return {
        userTrends,
        resourceTrends,
        topProviders: providers,
        topOfferings: offerings,
        activeUsers,
        projectTrends,
      };
    },
    staleTime: STALE_TIME,
  });
};
