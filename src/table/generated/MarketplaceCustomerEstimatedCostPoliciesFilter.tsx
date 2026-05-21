// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  Customer,
  MarketplaceCustomerEstimatedCostPoliciesListData,
  customersList,
} from 'waldur-js-client';

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

export const MarketplaceCustomerEstimatedCostPoliciesFilter: FunctionComponent<{}> =
  () => (
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
          />
        )}
      />
    </TableFilterItem>
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
