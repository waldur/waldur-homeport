// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  MarketplaceStatsOpenstackInstancesListData,
  Project,
  customersList,
  projectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter, StringFilter } from '@/table';

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
    <AsyncSelectFilter
      title={translate('Organization')}
      name="customer_uuid"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project_uuid"
      getValueLabel={(value: Project) => value?.name}
      placeholder={translate('Project')}
      loadOptions={createLoadOptions(projectsList, 'query', {
        customer: props.organizationUuid,
      })}
      defaultOptions
      getOptionValue={(option: Project) => String(option.uuid || '')}
      getOptionLabel={(option: Project) => String(option.name || '')}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Runtime state')}
      name="runtime_state"
      getValueLabel={(value: RuntimeStateOption) => value?.label}
      placeholder={translate('Runtime state')}
      options={RuntimeStateOptions}
      getOptionValue={(option: RuntimeStateOption) => String(option.value)}
      getOptionLabel={(option: RuntimeStateOption) => option.label}
      isClearable={true}
    />
    <StringFilter
      title={translate('Hypervisor')}
      name="hypervisor_hostname"
      placeholder={translate('Hypervisor hostname...')}
    />
    <StringFilter
      title={translate('Flavor')}
      name="flavor_name"
      placeholder={translate('Flavor name...')}
    />
    <StringFilter
      title={translate('Image')}
      name="image_name"
      placeholder={translate('Image name...')}
    />
  </>
);

export const MarketplaceStatsOpenstackInstancesFilterFormId =
  'MarketplaceStatsOpenstackInstancesFilter';

interface MarketplaceStatsOpenstackInstancesFilterProps {
  organizationUuid?: any;
}

export interface MarketplaceStatsOpenstackInstancesFilterFormData {
  customer_uuid: Customer;
  project_uuid: Project;
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
    if (values.customer_uuid) {
      filter.customer_uuid = values.customer_uuid.uuid;
    }
    if (values.project_uuid) {
      filter.project_uuid = values.project_uuid.uuid;
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
