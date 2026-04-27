// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  RancherIngressesListData,
  RancherNamespace,
  RancherProject,
  rancherNamespacesList,
  rancherProjectsList,
} from 'waldur-js-client';

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureRancherClusterFilter: FunctionComponent<RancherClusterFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Namespace')}
      name="namespace"
      getValueLabel={(value: RancherNamespace) => value?.name}
    >
      <Field
        name="namespace"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Namespace')}
            loadOptions={createSelectFetcher(rancherNamespacesList, 'name', {
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
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
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
          <AsyncPaginate
            placeholder={translate('Rancher project')}
            loadOptions={createSelectFetcher(rancherProjectsList, 'name', {
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
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
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

interface RancherClusterFilterFormData {
  namespace: RancherNamespace;
  rancher_project: RancherProject;
}

export const RancherClusterFilter = reduxForm<
  RancherClusterFilterFormData,
  RancherClusterFilterProps
>({
  form: RancherClusterFilterFormId,
  destroyOnUnmount: false,
})(PureRancherClusterFilter);

type RancherClusterFilterQuery = RancherIngressesListData['query'];

export const selectRancherClusterFilter = createSelector<
  RootState,
  Partial<RancherClusterFilterFormData>,
  RancherClusterFilterQuery
>(getFormValues(RancherClusterFilterFormId), (values) => {
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
});
