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
      name="organization"
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
      name="project"
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
  organization: Customer;
  project: Project;
}

type MarketplaceResourcesFilterQuery = MarketplaceResourcesListData['query'];

export const selectMarketplaceResourcesFilter = (
  values?: Partial<MarketplaceResourcesFilterFormData>,
): MarketplaceResourcesFilterQuery => {
  const filter: MarketplaceResourcesFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
  }
  return filter;
};
