import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  marketplaceStatsResourceUsageByCreatorAffiliationList,
  ResourceUsageByAffiliation,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';

import { AffiliationAggregation, UsageByAffiliationSummary } from './types'; // 5 minutes

export function useUsageByAffiliation() {
  const queryResult = useQuery({
    queryKey: ['usage-by-affiliation'],
    queryFn: async ({ signal }) => {
      const response =
        await marketplaceStatsResourceUsageByCreatorAffiliationList({
          signal,
        });
      return response.data as ResourceUsageByAffiliation[];
    },
    staleTime: STALE_TIME,
  });

  // Aggregate by affiliation
  const aggregatedData = useMemo<AffiliationAggregation[]>(() => {
    if (!queryResult.data) return [];

    const byAffiliation: Record<string, AffiliationAggregation> = {};

    queryResult.data.forEach((item) => {
      const affiliation = item.affiliation || translate('Unknown');
      if (!byAffiliation[affiliation]) {
        byAffiliation[affiliation] = {
          affiliation,
          total_usage: 0,
          total_cost: 0,
          total_resources: 0,
          components: {},
        };
      }
      byAffiliation[affiliation].total_usage += parseFloat(item.total_usage);
      byAffiliation[affiliation].total_cost += parseFloat(item.total_cost);
      byAffiliation[affiliation].total_resources += item.resource_count;
      byAffiliation[affiliation].components[item.component_type] =
        (byAffiliation[affiliation].components[item.component_type] || 0) +
        parseFloat(item.total_usage);
    });

    return Object.values(byAffiliation).sort(
      (a, b) => b.total_resources - a.total_resources,
    );
  }, [queryResult.data]);

  // Extract all unique component types
  const componentTypes = useMemo(() => {
    if (!queryResult.data) return [];
    const types = new Set<string>();
    queryResult.data.forEach((item) => types.add(item.component_type));
    return Array.from(types).sort();
  }, [queryResult.data]);

  // Compute summary
  const summary = useMemo<UsageByAffiliationSummary | null>(() => {
    if (!aggregatedData.length) return null;

    return {
      totalAffiliations: aggregatedData.length,
      totalResources: aggregatedData.reduce(
        (sum, item) => sum + item.total_resources,
        0,
      ),
      totalCost: aggregatedData.reduce((sum, item) => sum + item.total_cost, 0),
    };
  }, [aggregatedData]);

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: aggregatedData,
    rawData: queryResult.data,
    componentTypes,
    summary,
  };
}
