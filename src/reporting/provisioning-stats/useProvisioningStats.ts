import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  marketplaceStatsOrderStatsRetrieve,
  OrderStatsResponse,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

import { ProvisioningSummary } from './types'; // 5 minutes

interface UseProvisioningStatsOptions {
  days?: number;
}

export function computeSummary(stats: OrderStatsResponse): ProvisioningSummary {
  const byState = stats.by_state || {};
  const successfulOrders = byState.done || 0;
  const failedOrders = byState.erred || 0;
  const totalOrders = stats.summary?.total || 0;

  // Calculate success rate: done / (done + erred)
  const completedOrders = successfulOrders + failedOrders;
  const successRate =
    completedOrders > 0
      ? Math.round((successfulOrders / completedOrders) * 100)
      : 100;

  return {
    successRate,
    totalOrders,
    successfulOrders,
    failedOrders,
  };
}

export function useProvisioningStats(
  options: UseProvisioningStatsOptions = {},
) {
  const { days = 30 } = options;

  const { startDate, endDate } = useMemo(() => {
    const end = DateTime.now().toISODate();
    const start = DateTime.now().minus({ days }).toISODate();
    return { startDate: start, endDate: end };
  }, [days]);

  const queryResult = useQuery({
    queryKey: ['provisioning-stats', startDate, endDate],
    queryFn: async ({ signal }) => {
      const response = await marketplaceStatsOrderStatsRetrieve({
        query: {
          start: startDate,
          end: endDate,
        },
        signal,
      });
      return response.data as OrderStatsResponse;
    },
    staleTime: STALE_TIME,
  });

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: queryResult.data,
    startDate,
    endDate,
  };
}
