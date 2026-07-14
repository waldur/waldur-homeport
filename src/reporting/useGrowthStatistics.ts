import { useQuery } from '@tanstack/react-query';
import {
  marketplacePublicOfferingsCount,
  marketplaceResourcesCount,
  marketplaceServiceProvidersCount,
  marketplaceStatsAggregatedUsageTrendsList,
  marketplaceStatsCountActiveResourcesGroupedByOfferingList,
  marketplaceStatsCountUniqueUsersConnectedWithActiveResourcesOfServiceProviderList,
  marketplaceStatsProjectCreationTrendList,
  marketplaceStatsTopServiceProvidersByResourcesList,
  projectsCount as fetchProjectsCount,
  usersCount,
  usersUserRegistrationTrendList,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { STALE_TIME } from '@/core/constants'; // 5 minutes

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

        marketplaceServiceProvidersCount().then(fetchResultCount),

        marketplacePublicOfferingsCount().then(fetchResultCount),

        fetchProjectsCount().then(fetchResultCount),

        marketplaceResourcesCount({ query: { state: ['OK'] } }).then(
          fetchResultCount,
        ),

        usersCount({ query: { is_active: true } }).then(fetchResultCount),
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
