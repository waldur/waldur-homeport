// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  MarketplaceStatsOpenstackInstancesListData,
  Project,
  customersList,
  projectsList,
} from 'waldur-js-client';

import { StringField } from '@waldur/form';
import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const RuntimeStateOptions: RuntimeStateOption[] = [
  {
    value: 'ACTIVE',
    label: translate('Active'),
  },
  {
    value: 'ERROR',
    label: translate('Error'),
  },
  {
    value: 'PAUSED',
    label: translate('Paused'),
  },
  {
    value: 'SHUTOFF',
    label: translate('Shutoff'),
  },
  {
    value: 'SUSPENDED',
    label: translate('Suspended'),
  },
];
export interface RuntimeStateOption {
  label: string;
  value: string;
}

const PureMarketplaceStatsOpenstackInstancesFilter: FunctionComponent<
  MarketplaceStatsOpenstackInstancesFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
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
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
    >
      <Field
        name="project"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Project')}
            loadOptions={createSelectFetcher(projectsList, 'query', {
              customer: props.organizationUuid,
            })}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
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
      title={translate('Runtime state')}
      name="runtime_state"
      getValueLabel={(value: RuntimeStateOption) => value?.label}
    >
      <Field
        name="runtime_state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Runtime state')}
            options={RuntimeStateOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: RuntimeStateOption) =>
              String(option.value)
            }
            getOptionLabel={(option: RuntimeStateOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Hypervisor')} name="hypervisor_hostname">
      <Field
        name="hypervisor_hostname"
        component={StringField}
        placeholder={translate('Hypervisor hostname...')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Flavor')} name="flavor_name">
      <Field
        name="flavor_name"
        component={StringField}
        placeholder={translate('Flavor name...')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Image')} name="image_name">
      <Field
        name="image_name"
        component={StringField}
        placeholder={translate('Image name...')}
      />
    </TableFilterItem>
  </>
);

export const MarketplaceStatsOpenstackInstancesFilterFormId =
  'MarketplaceStatsOpenstackInstancesFilter';

interface MarketplaceStatsOpenstackInstancesFilterProps {
  organizationUuid?: any;
}

interface MarketplaceStatsOpenstackInstancesFilterFormData {
  organization: Customer;
  project: Project;
  runtime_state: RuntimeStateOption;
  hypervisor_hostname: string;
  flavor_name: string;
  image_name: string;
}

export const MarketplaceStatsOpenstackInstancesFilter = reduxForm<
  MarketplaceStatsOpenstackInstancesFilterFormData,
  MarketplaceStatsOpenstackInstancesFilterProps
>({
  form: MarketplaceStatsOpenstackInstancesFilterFormId,
  destroyOnUnmount: false,
})(PureMarketplaceStatsOpenstackInstancesFilter);

type MarketplaceStatsOpenstackInstancesFilterQuery =
  MarketplaceStatsOpenstackInstancesListData['query'];

export const selectMarketplaceStatsOpenstackInstancesFilter = createSelector<
  RootState,
  Partial<MarketplaceStatsOpenstackInstancesFilterFormData>,
  MarketplaceStatsOpenstackInstancesFilterQuery
>(getFormValues(MarketplaceStatsOpenstackInstancesFilterFormId), (values) => {
  const filter: MarketplaceStatsOpenstackInstancesFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
    if (values.runtime_state) {
      filter.runtime_state = values.runtime_state.value;
    }
    if (values.hypervisor_hostname) {
      filter.hypervisor_hostname = values.hypervisor_hostname;
    }
    if (values.flavor_name) {
      filter.flavor_name = values.flavor_name;
    }
    if (values.image_name) {
      filter.image_name = values.image_name;
    }
  }
  return filter;
});
