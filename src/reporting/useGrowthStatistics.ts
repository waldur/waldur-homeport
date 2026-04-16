import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsAggregatedUsageTrendsList,
  marketplaceStatsCountActiveResourcesGroupedByOfferingList,
  marketplaceStatsCountUniqueUsersConnectedWithActiveResourcesOfServiceProviderList,
  marketplaceStatsProjectCreationTrendList,
  marketplaceStatsTopServiceProvidersByResourcesList,
  usersUserRegistrationTrendList,
} from 'waldur-js-client';

// eslint-disable-next-line waldur-custom/no-direct-client-usage
import { count } from '@waldur/core/api';

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
        providersCount,
        offeringsCount,
        projectsCount,
        resourcesCount,
        activeUsersCount,
      ] = await Promise.all([
        usersUserRegistrationTrendList({ signal }).then((r) => r.data || []),
        marketplaceStatsAggregatedUsageTrendsList({ signal }).then(
          (r) => r.data || [],
        ),
        marketplaceStatsTopServiceProvidersByResourcesList({
          query: { page_size: 5 },
          signal,
        }).then((r) => r.data || []),
        marketplaceStatsCountActiveResourcesGroupedByOfferingList({
          query: { page_size: 5 },
          signal,
        }).then((r) => r.data || []),
        marketplaceStatsCountUniqueUsersConnectedWithActiveResourcesOfServiceProviderList(
          { signal },
        ).then((r) => r.data || []),
        marketplaceStatsProjectCreationTrendList({ signal }).then(
          (r) => r.data || [],
        ),

        count('/api/marketplace-service-providers/'),

        count('/api/marketplace-public-offerings/'),

        count('/api/projects/'),

        count('/api/marketplace-resources/', { state: ['OK'] }),

        count('/api/users/', { is_active: true }),
      ]);

      return {
        userTrends,
        resourceTrends,
        topProviders: providers,
        topOfferings: offerings,
        activeUsers,
        projectTrends,
        providersCount,
        offeringsCount,
        projectsCount,
        resourcesCount,
        activeUsersCount,
      };
    },
    staleTime: STALE_TIME,
  });
};
