// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplaceServiceProviderProjectGroupsListData,
  ProviderOfferingDetails,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const InUseOptions: InUseOption[] = [
  {
    label: translate('Not in use'),
    value: false,
  },
  {
    label: translate('In use'),
    value: true,
  },
];
export interface InUseOption {
  label: string;
  value: boolean;
}

export const MarketplaceServiceProviderProjectGroupsFilter: FunctionComponent<
  MarketplaceServiceProviderProjectGroupsFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('Usage')}
      name="in_use"
      getValueLabel={(value: InUseOption) => value?.label}
      options={InUseOptions}
      getOptionValue={(option: InUseOption) => String(option.value)}
      getOptionLabel={(option: InUseOption) => option.label}
      isClearable={true}
      placeholder={translate('Usage')}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: ProviderOfferingDetails) => value?.name}
      loadOptions={createLoadOptions(
        marketplaceProviderOfferingsList,
        'query',
        { customer_uuid: props.customerUuid },
      )}
      defaultOptions
      getOptionValue={(option: ProviderOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: ProviderOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
      placeholder={translate('Offering')}
    />
  </>
);

export const MarketplaceServiceProviderProjectGroupsFilterFormId =
  'MarketplaceServiceProviderProjectGroupsFilter';

interface MarketplaceServiceProviderProjectGroupsFilterProps {
  customerUuid?: any;
}

export interface MarketplaceServiceProviderProjectGroupsFilterFormData {
  in_use: InUseOption;
  offering: ProviderOfferingDetails;
}

type MarketplaceServiceProviderProjectGroupsFilterQuery =
  MarketplaceServiceProviderProjectGroupsListData['query'];

export const selectMarketplaceServiceProviderProjectGroupsFilter = (
  values?: Partial<MarketplaceServiceProviderProjectGroupsFilterFormData>,
): MarketplaceServiceProviderProjectGroupsFilterQuery => {
  const filter: MarketplaceServiceProviderProjectGroupsFilterQuery = {} as any;
  if (values) {
    if (values.in_use) {
      filter.in_use = values.in_use.value;
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
