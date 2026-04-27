import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectRancherClusterFilter } from '@/table/generated/RancherClusterFilter';

export const useClusterFilter = (cluster) => {
  const filterValues = useSelector(selectRancherClusterFilter);

  const filter = useMemo(
    () => ({
      cluster_uuid: cluster.uuid,
      ...filterValues,
    }),
    [cluster, filterValues],
  );
  return filter;
};

export const useClusterResourceFilter = (cluster) => {
  const filterValues = useSelector(selectRancherClusterFilter);

  const filter = useMemo(
    () => ({
      cluster_uuid: cluster.uuid,
      project_uuid: filterValues?.rancher_project_uuid,
      namespace_uuid: filterValues?.namespace_uuid,
      rancher_project_uuid: filterValues?.rancher_project_uuid,
    }),
    [cluster, filterValues],
  );
  return filter;
};
