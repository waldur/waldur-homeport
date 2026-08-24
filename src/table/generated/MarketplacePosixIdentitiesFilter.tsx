// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplacePosixIdentitiesListData,
  PosixIdentityConsumerTypeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const IsReleasedOptions: IsReleasedOption[] = [
  {
    label: translate('Active'),
    value: false,
  },
  {
    label: translate('Released'),
    value: true,
  },
  {
    label: translate('Any status'),
    value: 'undefined',
  },
];
export interface IsReleasedOption {
  label: string;
  value: any;
}

export const PosixIdentityConsumerTypeOptions: PosixIdentityConsumerTypeOption[] =
  [
    {
      label: translate('Role group'),
      value: 'offeringrolegroup',
    },
    {
      label: translate('Project group'),
      value: 'offeringusergroup',
    },
    {
      label: translate('Robot account'),
      value: 'robotaccount',
    },
    {
      label: translate('User'),
      value: 'user',
    },
  ];
export interface PosixIdentityConsumerTypeOption {
  label: string;
  value: PosixIdentityConsumerTypeEnum;
}

export const RecyclableOptions: RecyclableOption[] = [
  {
    label: translate('Withheld from the pool'),
    value: false,
  },
  {
    label: translate('Returned to the pool'),
    value: true,
  },
  {
    label: translate('All'),
    value: 'undefined',
  },
];
export interface RecyclableOption {
  label: string;
  value: any;
}

export const MarketplacePosixIdentitiesFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Principal kind')}
      name="consumer_type"
      getValueLabel={(value: PosixIdentityConsumerTypeOption) => value?.label}
      options={PosixIdentityConsumerTypeOptions}
      getOptionValue={(option: PosixIdentityConsumerTypeOption) =>
        String(option.value)
      }
      getOptionLabel={(option: PosixIdentityConsumerTypeOption) => option.label}
      isClearable={true}
      placeholder={translate('Any principal')}
    />
    <SelectFilter
      title={translate('Status')}
      name="is_released"
      getValueLabel={(value: IsReleasedOption) => value?.label}
      options={IsReleasedOptions}
      getOptionValue={(option: IsReleasedOption) => String(option.value)}
      getOptionLabel={(option: IsReleasedOption) => option.label}
      isClearable={true}
      placeholder={translate('Status')}
    />
    <SelectFilter
      title={translate('Recyclable')}
      name="recyclable"
      getValueLabel={(value: RecyclableOption) => value?.label}
      options={RecyclableOptions}
      getOptionValue={(option: RecyclableOption) => String(option.value)}
      getOptionLabel={(option: RecyclableOption) => option.label}
      isClearable={true}
      placeholder={translate('Recyclable')}
    />
  </>
);

export const MarketplacePosixIdentitiesFilterFormId =
  'MarketplacePosixIdentitiesFilter';

export interface MarketplacePosixIdentitiesFilterFormData {
  consumer_type: PosixIdentityConsumerTypeOption;
  is_released: IsReleasedOption;
  recyclable: RecyclableOption;
}

type MarketplacePosixIdentitiesFilterQuery =
  MarketplacePosixIdentitiesListData['query'];

export const selectMarketplacePosixIdentitiesFilter = (
  values?: Partial<MarketplacePosixIdentitiesFilterFormData>,
): MarketplacePosixIdentitiesFilterQuery => {
  const filter: MarketplacePosixIdentitiesFilterQuery = {} as any;
  if (values) {
    if (values.consumer_type) {
      filter.consumer_type = values.consumer_type.value;
    }
    if (values.is_released) {
      filter.is_released = values.is_released.value;
    }
    if (values.recyclable) {
      filter.recyclable = values.recyclable.value;
    }
  }
  return filter;
};
