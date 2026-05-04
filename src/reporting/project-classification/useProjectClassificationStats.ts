import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsCountProjectsGroupedByProviderAndIndustryFlagList,
  marketplaceStatsCountProjectsGroupedByProviderAndOecdList,
  marketplaceStatsProjectClassificationSummaryRetrieve,
  marketplaceStatsProjectsLimitsGroupedByIndustryFlagRetrieve,
  marketplaceStatsProjectsLimitsGroupedByOecdRetrieve,
  marketplaceStatsProjectsUsagesGroupedByIndustryFlagRetrieve,
  marketplaceStatsProjectsUsagesGroupedByOecdRetrieve,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

import { ClassificationSummary, ProjectClassificationStats } from './types'; // 5 minutes

async function fetchProjectClassificationStats(
  signal?: AbortSignal,
): Promise<ProjectClassificationStats> {
  const [
    oecdUsagesResponse,
    oecdLimitsResponse,
    industryUsagesResponse,
    industryLimitsResponse,
    oecdProjectCountsResponse,
    industryProjectCountsResponse,
  ] = await Promise.all([
    marketplaceStatsProjectsUsagesGroupedByOecdRetrieve({ signal }).catch(
      () => ({ data: null }),
    ),
    marketplaceStatsProjectsLimitsGroupedByOecdRetrieve({ signal }).catch(
      () => ({ data: null }),
    ),
    marketplaceStatsProjectsUsagesGroupedByIndustryFlagRetrieve({
      signal,
    }).catch(() => ({ data: null })),
    marketplaceStatsProjectsLimitsGroupedByIndustryFlagRetrieve({
      signal,
    }).catch(() => ({ data: null })),
    marketplaceStatsCountProjectsGroupedByProviderAndOecdList({ signal }).catch(
      () => ({ data: [] }),
    ),
    marketplaceStatsCountProjectsGroupedByProviderAndIndustryFlagList({
      signal,
    }).catch(() => ({ data: [] })),
  ]);

  return {
    oecdUsages: oecdUsagesResponse.data ?? null,
    oecdLimits: oecdLimitsResponse.data ?? null,
    industryUsages: industryUsagesResponse.data ?? null,
    industryLimits: industryLimitsResponse.data ?? null,
    oecdProjectCounts: oecdProjectCountsResponse.data ?? [],
    industryProjectCounts: industryProjectCountsResponse.data ?? [],
  };
}

async function fetchProjectClassificationSummary(
  signal?: AbortSignal,
): Promise<ClassificationSummary> {
  const response = await marketplaceStatsProjectClassificationSummaryRetrieve({
    signal,
  });
  const data = response.data;
  return {
    totalProjects: data.total_projects,
    academicProjects: data.academic_projects,
    industryProjects: data.industry_projects,
  };
}

export function useProjectClassificationStats() {
  return useQuery({
    queryKey: ['projectClassificationStats'],
    queryFn: ({ signal }) => fetchProjectClassificationStats(signal),
    staleTime: STALE_TIME,
  });
}

export function useProjectClassificationSummary() {
  return useQuery({
    queryKey: ['projectClassificationSummary'],
    queryFn: ({ signal }) => fetchProjectClassificationSummary(signal),
    staleTime: STALE_TIME,
  });
}
