// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  MarketplaceProjectUpdateRequestsListData,
  RemoteProjectUpdateRequestStateEnum,
  customersList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const RemoteProjectUpdateRequestStateOptions: RemoteProjectUpdateRequestStateOption[] =
  [
    {
      label: translate('Approved'),
      value: 'approved',
    },
    {
      label: translate('Canceled'),
      value: 'canceled',
    },
    {
      label: translate('Draft'),
      value: 'draft',
    },
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Rejected'),
      value: 'rejected',
    },
  ];
export interface RemoteProjectUpdateRequestStateOption {
  label: string;
  value: RemoteProjectUpdateRequestStateEnum;
}

const PureMarketplaceProjectUpdateRequestsFilter: FunctionComponent<{}> =
  () => (
    <>
      <TableFilterItem
        title={translate('State')}
        name="state"
        getValueLabel={(value: RemoteProjectUpdateRequestStateOption) =>
          value?.label
        }
      >
        <Field
          name="state"
          component={(fieldProps) => (
            <Select
              placeholder={translate('State')}
              options={RemoteProjectUpdateRequestStateOptions}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              getOptionValue={(option: RemoteProjectUpdateRequestStateOption) =>
                String(option.value)
              }
              getOptionLabel={(option: RemoteProjectUpdateRequestStateOption) =>
                option.label
              }
              isClearable={true}
              isMulti={true}
              {...REACT_SELECT_TABLE_FILTER}
            />
          )}
        />
      </TableFilterItem>
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
    </>
  );

export const MarketplaceProjectUpdateRequestsFilterFormId =
  'MarketplaceProjectUpdateRequestsFilter';

interface MarketplaceProjectUpdateRequestsFilterFormData {
  state: RemoteProjectUpdateRequestStateOption[];
  organization: Customer;
}

export const MarketplaceProjectUpdateRequestsFilter = reduxForm<
  MarketplaceProjectUpdateRequestsFilterFormData,
  {}
>({
  form: MarketplaceProjectUpdateRequestsFilterFormId,
  destroyOnUnmount: false,
  initialValues: { state: [{ value: 'pending', label: translate('Pending') }] },
})(PureMarketplaceProjectUpdateRequestsFilter);

type MarketplaceProjectUpdateRequestsFilterQuery =
  MarketplaceProjectUpdateRequestsListData['query'];

export const selectMarketplaceProjectUpdateRequestsFilter = createSelector<
  RootState,
  Partial<MarketplaceProjectUpdateRequestsFilterFormData>,
  MarketplaceProjectUpdateRequestsFilterQuery
>(getFormValues(MarketplaceProjectUpdateRequestsFilterFormId), (values) => {
  const filter: MarketplaceProjectUpdateRequestsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
  }
  return filter;
});
