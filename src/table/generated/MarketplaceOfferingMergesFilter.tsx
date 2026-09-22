// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplaceOfferingMergesListData,
  OfferingMergeStateEnum,
  ProviderOfferingDetails,
  User,
  marketplaceProviderOfferingsList,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const OfferingMergeStateOptions: OfferingMergeStateOption[] = [
  {
    label: translate('Done'),
    value: 'done',
  },
  {
    label: translate('Draft'),
    value: 'draft',
  },
  {
    label: translate('Failed'),
    value: 'failed',
  },
  {
    label: translate('Previewed'),
    value: 'previewed',
  },
  {
    label: translate('Queued'),
    value: 'queued',
  },
  {
    label: translate('Running'),
    value: 'running',
  },
  {
    label: translate('Undoing'),
    value: 'undoing',
  },
  {
    label: translate('Undone'),
    value: 'undone',
  },
];
export interface OfferingMergeStateOption {
  label: string;
  value: OfferingMergeStateEnum;
}

export const MarketplaceOfferingMergesFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: OfferingMergeStateOption) => value?.label}
      options={OfferingMergeStateOptions}
      getOptionValue={(option: OfferingMergeStateOption) =>
        String(option.value)
      }
      getOptionLabel={(option: OfferingMergeStateOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('State')}
    />
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: ProviderOfferingDetails) => value?.name}
      loadOptions={createLoadOptions(marketplaceProviderOfferingsList, 'name')}
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
    <AsyncSelectFilter
      title={translate('Created by')}
      name="created_by"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      loadOptions={createLoadOptions(usersList, 'full_name')}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
      placeholder={translate('Created by')}
    />
  </>
);

export const MarketplaceOfferingMergesFilterFormId =
  'MarketplaceOfferingMergesFilter';

export interface MarketplaceOfferingMergesFilterFormData {
  state: OfferingMergeStateOption[];
  offering: ProviderOfferingDetails;
  created_by: User;
}

type MarketplaceOfferingMergesFilterQuery =
  MarketplaceOfferingMergesListData['query'];

export const selectMarketplaceOfferingMergesFilter = (
  values?: Partial<MarketplaceOfferingMergesFilterFormData>,
): MarketplaceOfferingMergesFilterQuery => {
  const filter: MarketplaceOfferingMergesFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
    if (values.created_by) {
      filter.created_by_uuid = values.created_by.uuid;
    }
  }
  return filter;
};
