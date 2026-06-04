// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  MarketplaceProjectUpdateRequestsListData,
  RemoteProjectUpdateRequestStateEnum,
  customersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

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
      <SelectFilter
        title={translate('State')}
        name="state"
        getValueLabel={(value: RemoteProjectUpdateRequestStateOption) =>
          value?.label
        }
        placeholder={translate('State')}
        options={RemoteProjectUpdateRequestStateOptions}
        getOptionValue={(option: RemoteProjectUpdateRequestStateOption) =>
          String(option.value)
        }
        getOptionLabel={(option: RemoteProjectUpdateRequestStateOption) =>
          option.label
        }
        isClearable={true}
        isMulti={true}
      />
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
