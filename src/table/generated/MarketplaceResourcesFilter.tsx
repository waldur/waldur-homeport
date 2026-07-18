// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  MarketplaceResourcesListData,
  Project,
  customersList,
  projectsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const MarketplaceResourcesFilter: FunctionComponent<
  MarketplaceResourcesFilterProps
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
  </>
);

export const MarketplaceResourcesFilterFormId = 'MarketplaceResourcesFilter';

interface MarketplaceResourcesFilterProps {
  organizationUuid?: any;
}

export interface MarketplaceResourcesFilterFormData {
  customer_uuid: Customer;
  project_uuid: Project;
}

type MarketplaceResourcesFilterQuery = MarketplaceResourcesListData['query'];

export const selectMarketplaceResourcesFilter = (
  values?: Partial<MarketplaceResourcesFilterFormData>,
): MarketplaceResourcesFilterQuery => {
  const filter: MarketplaceResourcesFilterQuery = {} as any;
  if (values) {
    if (values.customer_uuid) {
      filter.customer_uuid = values.customer_uuid.uuid;
    }
    if (values.project_uuid) {
      filter.project_uuid = values.project_uuid.uuid;
    }
  }
  return filter;
};
