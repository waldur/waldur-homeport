import { useQuery } from '@tanstack/react-query';
import {
  OpenStackInstanceAggregate,
  OpenStackInstanceAggregateGroupByEnum,
  marketplaceStatsOpenstackInstancesAggregateList,
  marketplaceStatsOpenstackInstancesList,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { createFetcher } from '@/table/api';

export const openstackInstancesFetcher = createFetcher(
  marketplaceStatsOpenstackInstancesList,
);

const fetchAggregate = async (
  groupBy: OpenStackInstanceAggregateGroupByEnum,
  filter?: Record<string, any>,
): Promise<OpenStackInstanceAggregate[]> => {
  const result = await marketplaceStatsOpenstackInstancesAggregateList({
    query: { group_by: groupBy, ...filter },
  });
  return result.data as OpenStackInstanceAggregate[];
};

export const useOpenstackInstancesAggregate = (
  groupBy: OpenStackInstanceAggregateGroupByEnum,
  filter?: Record<string, any>,
) =>
  useQuery({
    queryKey: ['openstackInstancesAggregate', groupBy, filter],
    queryFn: () => fetchAggregate(groupBy, filter),
    staleTime: STALE_TIME,
  });

export const useOpenstackInstancesSummary = (filter?: Record<string, any>) =>
  useQuery({
    queryKey: ['openstackInstancesSummary', filter],
    queryFn: async () => {
      const data = await fetchAggregate('runtime_state', filter);
      let totalInstances = 0;
      let activeInstances = 0;
      let totalCores = 0;
      let totalRamMb = 0;
      let totalDiskMb = 0;

      for (const item of data) {
        totalInstances += item.instance_count;
        totalCores += item.total_cores;
        totalRamMb += item.total_ram_mb;
        totalDiskMb += item.total_disk_mb;
        if (item.group_key === 'ACTIVE') {
          activeInstances = item.instance_count;
        }
      }

      return {
        totalInstances,
        activeInstances,
        totalCores,
        totalRamMb,
        totalDiskMb,
      };
    },
    staleTime: STALE_TIME,
  });
