// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  RancherIngressesListData,
  RancherNamespace,
  RancherProject,
  rancherNamespacesList,
  rancherProjectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const RancherClusterFilter: FunctionComponent<
  RancherClusterFilterProps
> = (props) => (
  <>
    <AsyncSelectFilter
      title={translate('Namespace')}
      name="namespace"
      getValueLabel={(value: RancherNamespace) => value?.name}
      placeholder={translate('Namespace')}
      loadOptions={createLoadOptions(rancherNamespacesList, 'name', {
        cluster_uuid: props.cluster.uuid,
      })}
      defaultOptions
      getOptionValue={(option: RancherNamespace) => String(option.uuid || '')}
      getOptionLabel={(option: RancherNamespace) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Rancher project')}
      name="rancher_project"
      getValueLabel={(value: RancherProject) => value?.name}
      placeholder={translate('Rancher project')}
      loadOptions={createLoadOptions(rancherProjectsList, 'name', {
        cluster_uuid: props.cluster.uuid,
      })}
      defaultOptions
      getOptionValue={(option: RancherProject) => String(option.uuid || '')}
      getOptionLabel={(option: RancherProject) => String(option.name || '')}
      isClearable={true}
    />
  </>
);

export const RancherClusterFilterFormId = 'RancherClusterFilter';

interface RancherClusterFilterProps {
  cluster?: any;
}

export interface RancherClusterFilterFormData {
  namespace: RancherNamespace;
  rancher_project: RancherProject;
}

type RancherClusterFilterQuery = RancherIngressesListData['query'];

export const selectRancherClusterFilter = (
  values?: Partial<RancherClusterFilterFormData>,
): RancherClusterFilterQuery => {
  const filter: RancherClusterFilterQuery = {} as any;
  if (values) {
    if (values.namespace) {
      filter.namespace_uuid = values.namespace.uuid;
    }
    if (values.rancher_project) {
      filter.rancher_project_uuid = values.rancher_project.uuid;
    }
  }
  return filter;
};
