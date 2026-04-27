import { useQuery } from '@tanstack/react-query';
import {
  maintenanceAnnouncementsMaintenanceStatsRetrieve,
  MaintenanceStatsResponse,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

import { MaintenanceFilterState } from './types';

type UseMaintenanceStatsAggregatedOptions = Pick<
  MaintenanceFilterState,
  'startDate' | 'endDate' | 'providerUuid'
>;

export const useMaintenanceStatsAggregated = (
  options: UseMaintenanceStatsAggregatedOptions,
) => {
  const { startDate, endDate, providerUuid } = options;

  const queryResult = useQuery({
    queryKey: ['maintenance-stats', startDate, endDate, providerUuid],
    queryFn: async ({ signal }) => {
      const response = await maintenanceAnnouncementsMaintenanceStatsRetrieve({
        query: {
          start: startDate,
          end: endDate,
          provider_uuid: providerUuid,
        },
        signal,
      });

      return response.data as MaintenanceStatsResponse;
    },
    staleTime: STALE_TIME,
  });

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    stats: queryResult.data,
  };
};
