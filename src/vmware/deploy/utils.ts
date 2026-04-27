import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { vmwareLimitsRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { minAmount } from '@/marketplace/common/utils';

export const minOne = minAmount(1);

export const useVMwareLimitsLoader = (settingsId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['volumeTypes', settingsId],

    queryFn: () =>
      vmwareLimitsRetrieve({ path: { uuid: settingsId } }).then(
        (response) => response.data,
      ),

    staleTime: UI_STALE_TIME,
  });
  const limits = useMemo(
    () =>
      data
        ? {
            max_cpu: data.max_cpu,
            max_cores_per_socket: data.max_cores_per_socket,
            max_ram: data.max_ram && data.max_ram / 1024,
            max_disk: data.max_disk && data.max_disk / 1024,
            max_disk_total: data.max_disk_total && data.max_disk_total / 1024,
          }
        : {},
    [data],
  );
  return { limits, isLoading, error };
};
