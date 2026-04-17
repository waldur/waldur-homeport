import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsCountActiveResourcesGroupedByOfferingCountryList,
  marketplaceStatsCountActiveResourcesGroupedByOrganizationGroupList,
  marketplaceStatsResourcesGeographySummaryRetrieve,
  ResourcesGeographySummary as ApiResourcesGeographySummary,
} from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';

import { ResourcesGeographyStats, ResourcesGeographySummary } from './types'; // 5 minutes

async function fetchResourcesGeographyStats(
  signal?: AbortSignal,
): Promise<ResourcesGeographyStats> {
  const [byCountryResponse, byOrgGroupResponse] = await Promise.all([
    marketplaceStatsCountActiveResourcesGroupedByOfferingCountryList({
      signal,
    }),
    marketplaceStatsCountActiveResourcesGroupedByOrganizationGroupList({
      signal,
    }),
  ]);

  return {
    byCountry: byCountryResponse.data ?? [],
    byOrgGroup: byOrgGroupResponse.data ?? [],
  };
}

async function fetchResourcesGeographySummary(
  signal?: AbortSignal,
): Promise<ResourcesGeographySummary> {
  const response = await marketplaceStatsResourcesGeographySummaryRetrieve({
    signal,
  });
  const data = response.data as ApiResourcesGeographySummary;
  return {
    totalResources: data.total_resources,
    countriesWithResources: data.countries_count,
    orgGroupsWithResources: data.org_groups_count,
    offeringsWithResources: data.offerings_count,
  };
}

export function useResourcesGeographyStats() {
  return useQuery({
    queryKey: ['resourcesGeographyStats'],
    queryFn: ({ signal }) => fetchResourcesGeographyStats(signal),
    staleTime: STALE_TIME,
  });
}

export function useResourcesGeographySummary() {
  return useQuery({
    queryKey: ['resourcesGeographySummary'],
    queryFn: ({ signal }) => fetchResourcesGeographySummary(signal),
    staleTime: STALE_TIME,
  });
}
