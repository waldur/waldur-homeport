import { useQuery } from '@tanstack/react-query';
import { maintenanceAnnouncementsList } from 'waldur-js-client';

import { MaintenanceFilterState } from './types';

type UseMaintenanceStatsOptions = MaintenanceFilterState;

export const useMaintenanceStats = (options: UseMaintenanceStatsOptions) => {
  const { startDate, endDate, providerUuid, states, maintenanceType } = options;

  const queryResult = useQuery({
    queryKey: [
      'maintenance-announcements',
      startDate,
      endDate,
      providerUuid,
      states,
      maintenanceType,
    ],
    queryFn: async ({ signal }) => {
      const response = await maintenanceAnnouncementsList({
        query: {
          scheduled_start_after: startDate,
          scheduled_end_before: endDate,
          service_provider_uuid: providerUuid,
          state: states as any,
          maintenance_type: maintenanceType,
          page_size: 200,
          o: ['-scheduled_start'],
        },
        signal,
      });

      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    announcements: queryResult.data,
  };
};
