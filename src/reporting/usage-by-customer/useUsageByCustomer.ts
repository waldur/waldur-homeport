import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  marketplaceStatsResourceUsageByCustomerList,
  ResourceUsageByCustomer,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

import { UsageByCustomerSummary } from './types'; // 5 minutes

function computeSummary(
  data: ResourceUsageByCustomer[],
): UsageByCustomerSummary {
  const totalCustomers = data.length;
  const totalResources = data.reduce(
    (sum, item) => sum + item.resources_total,
    0,
  );
  const totalCost = data.reduce(
    (sum, item) => sum + parseFloat(item.total_cost),
    0,
  );
  const customersWithErrors = data.filter(
    (item) => item.resources_erred > 0,
  ).length;

  return {
    totalCustomers,
    totalResources,
    totalCost,
    customersWithErrors,
  };
}

export function useUsageByCustomer() {
  const queryResult = useQuery({
    queryKey: ['usage-by-customer'],
    queryFn: async ({ signal }) => {
      const response = await marketplaceStatsResourceUsageByCustomerList({
        signal,
      });
      return response.data;
    },
    staleTime: STALE_TIME,
  });

  const rows: ResourceUsageByCustomer[] = useMemo(() => {
    if (!queryResult.data) return [];
    return queryResult.data;
  }, [queryResult.data]);

  const summary = useMemo(() => {
    if (!queryResult.data) return null;
    return computeSummary(queryResult.data);
  }, [queryResult.data]);

  // Extract all unique component types and limit names
  const componentTypes = useMemo(() => {
    if (!queryResult.data) return [];
    const types = new Set<string>();
    queryResult.data.forEach((item) => {
      Object.keys(item.usages).forEach((key) => types.add(key));
    });
    return Array.from(types).sort();
  }, [queryResult.data]);

  const limitNames = useMemo(() => {
    if (!queryResult.data) return [];
    const names = new Set<string>();
    queryResult.data.forEach((item) => {
      Object.keys(item.limits).forEach((key) => names.add(key));
    });
    return Array.from(names).sort();
  }, [queryResult.data]);

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: rows,
    summary,
    componentTypes,
    limitNames,
  };
}
