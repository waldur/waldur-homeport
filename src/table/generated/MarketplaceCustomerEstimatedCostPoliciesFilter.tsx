// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  MarketplaceCustomerEstimatedCostPoliciesListData,
  customersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const MarketplaceCustomerEstimatedCostPoliciesFilter: FunctionComponent<{}> =
  () => (
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
  );

export const MarketplaceCustomerEstimatedCostPoliciesFilterFormId =
  'MarketplaceCustomerEstimatedCostPoliciesFilter';

export interface MarketplaceCustomerEstimatedCostPoliciesFilterFormData {
  organization: Customer;
}

type MarketplaceCustomerEstimatedCostPoliciesFilterQuery =
  MarketplaceCustomerEstimatedCostPoliciesListData['query'];

export const selectMarketplaceCustomerEstimatedCostPoliciesFilter = (
  values?: Partial<MarketplaceCustomerEstimatedCostPoliciesFilterFormData>,
): MarketplaceCustomerEstimatedCostPoliciesFilterQuery => {
  const filter: MarketplaceCustomerEstimatedCostPoliciesFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
  }
  return filter;
};
