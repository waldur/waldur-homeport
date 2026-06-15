import { useMemo } from 'react';

import { selectRancherClusterFilter } from '@/table/generated/RancherClusterFilter';
import { useFilterValues } from '@/table/useFilterValues';

export const useClusterFilter = (cluster, tableId) => {
  const values = useFilterValues(tableId);
  const filterValues = useMemo(
    () => selectRancherClusterFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      cluster_uuid: cluster.uuid,
      ...filterValues,
    }),
    [cluster, filterValues],
  );
  return { filter };
};

export const useClusterResourceFilter = (cluster, tableId) => {
  const values = useFilterValues(tableId);
  const filterValues = useMemo(
    () => selectRancherClusterFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      cluster_uuid: cluster.uuid,
      project_uuid: filterValues?.rancher_project_uuid,
      namespace_uuid: filterValues?.namespace_uuid,
      rancher_project_uuid: filterValues?.rancher_project_uuid,
    }),
    [cluster, filterValues],
  );
  return { filter };
};
