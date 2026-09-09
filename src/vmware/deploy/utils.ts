import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { vmwareLimitsRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { minAmount } from '@/marketplace/common/utils';

export const minOne = minAmount(1);

/**
 * The offering's ceilings for a VM's hardware.
 *
 * These bound the hardware fields; none of them is needed to render one, and a
 * step must not hold its fields back until they arrive. A field that registers
 * with react-final-form in the same commit as the template step's write of
 * cpu, ram and disk misses that notification and stays at zero, with no way
 * back: re-picking the template writes a value the form already holds, which
 * final-form does not notify on.
 */
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
