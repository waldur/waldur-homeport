import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { minAmount } from '@waldur/marketplace/common/utils';

import { getVMwareLimits } from '../api';

export const minOne = minAmount(1);

export const useVMwareLimitsLoader = (settingsId: string) => {
  const { data, isLoading, error } = useQuery(
    ['volumeTypes', settingsId],
    () => getVMwareLimits(settingsId),
    { staleTime: 3 * 60 * 1000 },
  );
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
