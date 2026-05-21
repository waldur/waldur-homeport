// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
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
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

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

export const MarketplaceProjectUpdateRequestsFilter: FunctionComponent<{}> =
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
            />
          )}
        />
      </TableFilterItem>
    </>
  );

export const MarketplaceProjectUpdateRequestsFilterFormId =
  'MarketplaceProjectUpdateRequestsFilter';

export interface MarketplaceProjectUpdateRequestsFilterFormData {
  state: RemoteProjectUpdateRequestStateOption[];
  organization: Customer;
}

export const MarketplaceProjectUpdateRequestsFilterInitialValues = {
  state: [{ value: 'pending', label: translate('Pending') }],
};

type MarketplaceProjectUpdateRequestsFilterQuery =
  MarketplaceProjectUpdateRequestsListData['query'];

export const selectMarketplaceProjectUpdateRequestsFilter = (
  values?: Partial<MarketplaceProjectUpdateRequestsFilterFormData>,
): MarketplaceProjectUpdateRequestsFilterQuery => {
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
};
