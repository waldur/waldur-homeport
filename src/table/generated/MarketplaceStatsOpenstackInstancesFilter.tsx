// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  Customer,
  MarketplaceStatsOpenstackInstancesListData,
  Project,
  customersList,
  projectsList,
} from 'waldur-js-client';

import { StringField } from '@/form';
import { Select, AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

export const MarketplaceStatsOpenstackInstancesFilter: FunctionComponent<
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
          <AsyncSelect
            placeholder={translate('Organization')}
            loadOptions={createLoadOptions(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
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
          <AsyncSelect
            placeholder={translate('Project')}
            loadOptions={createLoadOptions(projectsList, 'query', {
              customer: props.organizationUuid,
            })}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            variant="tableFilter"
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
            variant="tableFilter"
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

export interface MarketplaceStatsOpenstackInstancesFilterFormData {
  organization: Customer;
  project: Project;
  runtime_state: RuntimeStateOption;
  hypervisor_hostname: string;
  flavor_name: string;
  image_name: string;
}

type MarketplaceStatsOpenstackInstancesFilterQuery =
  MarketplaceStatsOpenstackInstancesListData['query'];

export const selectMarketplaceStatsOpenstackInstancesFilter = (
  values?: Partial<MarketplaceStatsOpenstackInstancesFilterFormData>,
): MarketplaceStatsOpenstackInstancesFilterQuery => {
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
};
