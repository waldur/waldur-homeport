// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  MarketplacePlansUsageStatsListData,
  ProviderOfferingDetails,
  ServiceProvider,
  marketplaceProviderOfferingsList,
  marketplaceServiceProvidersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter } from '@/table';

export const MarketplacePlansUsageStatsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Service provider')}
      name="provider"
      getValueLabel={(value: ServiceProvider) => value?.customer_name}
      placeholder={translate('Service provider')}
      loadOptions={createLoadOptions(
        marketplaceServiceProvidersList,
        'customer_keyword',
      )}
      defaultOptions
      getOptionValue={(option: ServiceProvider) =>
        String(option.customer_uuid || '')
      }
      getOptionLabel={(option: ServiceProvider) =>
        String(option.customer_name || '')
      }
      isClearable={true}
    />
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
  </>
);

export const MarketplacePlansUsageStatsFilterFormId =
  'MarketplacePlansUsageStatsFilter';

export interface MarketplacePlansUsageStatsFilterFormData {
  provider: ServiceProvider;
  offering: ProviderOfferingDetails;
}

type MarketplacePlansUsageStatsFilterQuery =
  MarketplacePlansUsageStatsListData['query'];

export const selectMarketplacePlansUsageStatsFilter = (
  values?: Partial<MarketplacePlansUsageStatsFilterFormData>,
): MarketplacePlansUsageStatsFilterQuery => {
  const filter: MarketplacePlansUsageStatsFilterQuery = {} as any;
  if (values) {
    if (values.provider) {
      filter.customer_provider_uuid = values.provider.customer_uuid;
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
