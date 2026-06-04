// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplacePlanComponentsListData,
  ProviderOfferingDetails,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const MarketplacePlanComponentsFilter: FunctionComponent<{}> = () => (
  <AsyncSelectFilter
    title={translate('Offering')}
    name="offering"
    getValueLabel={(value: ProviderOfferingDetails) => value?.name}
    placeholder={translate('Offering')}
    loadOptions={createLoadOptions(marketplaceProviderOfferingsList, 'name')}
    defaultOptions
    getOptionValue={(option: ProviderOfferingDetails) =>
      String(option.uuid || '')
    }
    getOptionLabel={(option: ProviderOfferingDetails) =>
      String(option.name || '')
    }
    isClearable={true}
  />
);

export const MarketplacePlanComponentsFilterFormId =
  'MarketplacePlanComponentsFilter';

export interface MarketplacePlanComponentsFilterFormData {
  offering: ProviderOfferingDetails;
}

type MarketplacePlanComponentsFilterQuery =
  MarketplacePlanComponentsListData['query'];

export const selectMarketplacePlanComponentsFilter = (
  values?: Partial<MarketplacePlanComponentsFilterFormData>,
): MarketplacePlanComponentsFilterQuery => {
  const filter: MarketplacePlanComponentsFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
