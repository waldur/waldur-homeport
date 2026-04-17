import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  marketplaceStatsResourceUsageByOrganizationTypeList,
  ResourceUsageByOrgType,
} from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';
import { translate } from '@waldur/i18n';

import { OrgTypeAggregation, UsageByOrgTypeSummary } from './types'; // 5 minutes

export function useUsageByOrgType() {
  const queryResult = useQuery({
    queryKey: ['usage-by-org-type'],
    queryFn: async ({ signal }) => {
      const response =
        await marketplaceStatsResourceUsageByOrganizationTypeList({
          signal,
        });
      return response.data as ResourceUsageByOrgType[];
    },
    staleTime: STALE_TIME,
  });

  // Aggregate by organization type
  const aggregatedData = useMemo<OrgTypeAggregation[]>(() => {
    if (!queryResult.data) return [];

    const byOrgType: Record<string, OrgTypeAggregation> = {};

    queryResult.data.forEach((item) => {
      const orgType = item.organization_type || translate('Unknown');
      if (!byOrgType[orgType]) {
        byOrgType[orgType] = {
          organization_type: orgType,
          total_usage: 0,
          total_resources: 0,
          components: {},
        };
      }
      byOrgType[orgType].total_usage += parseFloat(item.usage);
      byOrgType[orgType].total_resources += item.resource_count;
      byOrgType[orgType].components[item.component_type] =
        (byOrgType[orgType].components[item.component_type] || 0) +
        parseFloat(item.usage);
    });

    return Object.values(byOrgType).sort(
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
  const summary = useMemo<UsageByOrgTypeSummary | null>(() => {
    if (!aggregatedData.length) return null;

    return {
      totalOrgTypes: aggregatedData.length,
      totalResources: aggregatedData.reduce(
        (sum, item) => sum + item.total_resources,
        0,
      ),
      totalUsage: aggregatedData.reduce(
        (sum, item) => sum + item.total_usage,
        0,
      ),
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
