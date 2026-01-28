import { useQuery } from '@tanstack/react-query';
import {
  marketplaceStatsTotalCostOfActiveResourcesPerOfferingList,
  marketplaceStatsOfferingCostsSummaryRetrieve,
  OfferingCostsSummary as ApiOfferingCostsSummary,
} from 'waldur-js-client';

import { OfferingCostsSummary, OfferingCostsStats } from './types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

async function fetchOfferingCosts(
  signal?: AbortSignal,
): Promise<OfferingCostsStats> {
  const response =
    await marketplaceStatsTotalCostOfActiveResourcesPerOfferingList({ signal });
  return {
    offerings: response.data ?? [],
  };
}

async function fetchOfferingCostsSummary(
  signal?: AbortSignal,
): Promise<OfferingCostsSummary> {
  const response = await marketplaceStatsOfferingCostsSummaryRetrieve({
    signal,
  });
  const data = response.data as ApiOfferingCostsSummary;
  return {
    totalCost: parseFloat(data.total_cost),
    offeringCount: data.offering_count,
    averageCost: parseFloat(data.average_cost),
  };
}

export function useOfferingCosts() {
  return useQuery({
    queryKey: ['offeringCosts'],
    queryFn: ({ signal }) => fetchOfferingCosts(signal),
    staleTime: STALE_TIME,
  });
}

export function useOfferingCostsSummary() {
  return useQuery({
    queryKey: ['offeringCostsSummary'],
    queryFn: ({ signal }) => fetchOfferingCostsSummary(signal),
    staleTime: STALE_TIME,
  });
}
