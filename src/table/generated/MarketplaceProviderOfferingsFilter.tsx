// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplaceProviderOfferingsListData,
  OfferingState,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const OfferingStateOptions: OfferingStateOption[] = [
  {
    label: translate('Active'),
    value: 'Active',
  },
  {
    label: translate('Archived'),
    value: 'Archived',
  },
  {
    label: translate('Draft'),
    value: 'Draft',
  },
  {
    label: translate('Paused'),
    value: 'Paused',
  },
  {
    label: translate('Unavailable'),
    value: 'Unavailable',
  },
];
export interface OfferingStateOption {
  label: string;
  value: OfferingState;
}

export const MarketplaceProviderOfferingsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('State')}
    name="state"
    getValueLabel={(value: OfferingStateOption) => value?.label}
    placeholder={translate('State')}
    options={OfferingStateOptions}
    getOptionValue={(option: OfferingStateOption) => String(option.value)}
    getOptionLabel={(option: OfferingStateOption) => option.label}
    isClearable={true}
    isMulti={true}
  />
);

export const MarketplaceProviderOfferingsFilterFormId =
  'MarketplaceProviderOfferingsFilter';

export interface MarketplaceProviderOfferingsFilterFormData {
  state: OfferingStateOption[];
}

export const MarketplaceProviderOfferingsFilterInitialValues = {
  state: [
    { label: translate('Draft'), value: 'Draft' },
    { label: translate('Active'), value: 'Active' },
  ],
};

type MarketplaceProviderOfferingsFilterQuery =
  MarketplaceProviderOfferingsListData['query'];

export const selectMarketplaceProviderOfferingsFilter = (
  values?: Partial<MarketplaceProviderOfferingsFilterFormData>,
): MarketplaceProviderOfferingsFilterQuery => {
  const filter: MarketplaceProviderOfferingsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
};
