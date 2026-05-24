// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  RancherIngressesListData,
  RancherNamespace,
  RancherProject,
  rancherNamespacesList,
  rancherProjectsList,
} from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const RancherClusterFilter: FunctionComponent<
  RancherClusterFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Namespace')}
      name="namespace"
      getValueLabel={(value: RancherNamespace) => value?.name}
    >
      <Field
        name="namespace"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Namespace')}
            loadOptions={createLoadOptions(rancherNamespacesList, 'name', {
              cluster_uuid: props.cluster.uuid,
            })}
            defaultOptions
            getOptionValue={(option: RancherNamespace) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: RancherNamespace) =>
              String(option.name || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Rancher project')}
      name="rancher_project"
      getValueLabel={(value: RancherProject) => value?.name}
    >
      <Field
        name="rancher_project"
        component={(fieldProps) => (
          <AsyncSelect
            placeholder={translate('Rancher project')}
            loadOptions={createLoadOptions(rancherProjectsList, 'name', {
              cluster_uuid: props.cluster.uuid,
            })}
            defaultOptions
            getOptionValue={(option: RancherProject) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: RancherProject) =>
              String(option.name || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
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
