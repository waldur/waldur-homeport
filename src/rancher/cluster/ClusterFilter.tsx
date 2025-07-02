import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { NamespaceAutocomplete } from './hpas/NamespaceAutocomplete';
import { ProjectAutocomplete } from './hpas/ProjectAutocomplete';

export const ClusterFilter = reduxForm<{}, { cluster }>({
  form: 'rancherClusterFilter',
  destroyOnUnmount: false,
})(({ cluster }) => (
  <>
    <TableFilterItem
      title={translate('Namespace')}
      name="namespace"
      getValueLabel={(option) => option.name}
    >
      <NamespaceAutocomplete cluster={cluster} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="rancher_project"
      getValueLabel={(option) => option.name}
    >
      <ProjectAutocomplete cluster={cluster} />
    </TableFilterItem>
  </>
));

export const useClusterFilter = (cluster) => {
  const rancherClusterFilter: any = useSelector(
    getFormValues('rancherClusterFilter'),
  );

  const filter = useMemo(
    () => ({
      cluster_uuid: cluster.uuid,
      project_uuid: rancherClusterFilter?.project?.uuid,
      namespace_uuid: rancherClusterFilter?.namespace?.uuid,
    }),
    [cluster, rancherClusterFilter],
  );
  return filter;
};

export const useClusterResourceFilter = (cluster) => {
  const rancherClusterFilter: any = useSelector(
    getFormValues('rancherClusterFilter'),
  );

  const filter = useMemo(
    () => ({
      cluster_uuid: cluster.uuid,
      rancher_project_uuid: rancherClusterFilter?.rancher_project?.uuid,
      namespace_uuid: rancherClusterFilter?.namespace?.uuid,
    }),
    [cluster, rancherClusterFilter],
  );
  return filter;
};
