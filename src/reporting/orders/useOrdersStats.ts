import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { marketplaceStatsOrderStatsRetrieve } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

interface UseOrdersStatsOptions {
  days?: number;
  provider_uuid?: string;
  customer_uuid?: string;
}

export const useOrdersStats = (options: UseOrdersStatsOptions = {}) => {
  const { days = 30, provider_uuid, customer_uuid } = options;

  const { startDate, endDate } = useMemo(() => {
    const end = DateTime.now().toISODate();
    const start = DateTime.now().minus({ days }).toISODate();
    return { startDate: start, endDate: end };
  }, [days]);

  const queryResult = useQuery({
    queryKey: ['order-stats', startDate, endDate, provider_uuid, customer_uuid],
    queryFn: async ({ signal }) => {
      const response = await marketplaceStatsOrderStatsRetrieve({
        query: {
          start: startDate,
          end: endDate,
          provider_uuid,
          customer_uuid,
        },
        signal,
      });

      return response.data;
    },
    staleTime: STALE_TIME,
  });

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    data: queryResult.data,
    startDate,
  };
};
