// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  MarketplaceCustomerEstimatedCostPoliciesListData,
  customersList,
} from 'waldur-js-client';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureOrganizationCostPoliciesFilter: FunctionComponent<
  OrganizationCostPoliciesFilterProps
> = (props) => (
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
          getOptionValue={
            props.getOptionValue ||
            ((option: Customer) => String(option.uuid || ''))
          }
          getOptionLabel={
            props.getOptionLabel ||
            ((option: Customer) => String(option.name || ''))
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
);

export const OrganizationCostPoliciesFilterFormId =
  'OrganizationCostPoliciesFilter';

interface OrganizationCostPoliciesFilterProps {
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => string;
}

interface OrganizationCostPoliciesFilterFormData {
  organization: Customer;
}

export const OrganizationCostPoliciesFilter = reduxForm<
  OrganizationCostPoliciesFilterFormData,
  OrganizationCostPoliciesFilterProps
>({
  form: OrganizationCostPoliciesFilterFormId,
  destroyOnUnmount: false,
})(PureOrganizationCostPoliciesFilter);

export const selectOrganizationCostPoliciesFilter = createSelector(
  getFormValues(OrganizationCostPoliciesFilterFormId),
  (values: OrganizationCostPoliciesFilterFormData | undefined) => {
    const filter: MarketplaceCustomerEstimatedCostPoliciesListData['query'] =
      {};
    if (values) {
      if (values.organization) {
        filter.customer_uuid = values.organization.uuid;
      }
    }
    return filter;
  },
);
