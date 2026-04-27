// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplacePlansUsageStatsListData,
  ProviderOfferingDetails,
  ServiceProvider,
  marketplaceProviderOfferingsList,
  marketplaceServiceProvidersList,
} from 'waldur-js-client';

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureMarketplacePlansUsageStatsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Service provider')}
      name="provider"
      getValueLabel={(value: ServiceProvider) => value?.customer_name}
    >
      <Field
        name="provider"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Service provider')}
            loadOptions={createSelectFetcher(
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
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: ProviderOfferingDetails) => value?.name}
    >
      <Field
        name="offering"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Offering')}
            loadOptions={createSelectFetcher(
              marketplaceProviderOfferingsList,
              'name',
            )}
            defaultOptions
            getOptionValue={(option: ProviderOfferingDetails) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: ProviderOfferingDetails) =>
              String(option.name || '')
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
  </>
);

export const MarketplacePlansUsageStatsFilterFormId =
  'MarketplacePlansUsageStatsFilter';

interface MarketplacePlansUsageStatsFilterFormData {
  provider: ServiceProvider;
  offering: ProviderOfferingDetails;
}

export const MarketplacePlansUsageStatsFilter = reduxForm<
  MarketplacePlansUsageStatsFilterFormData,
  {}
>({
  form: MarketplacePlansUsageStatsFilterFormId,
  destroyOnUnmount: false,
})(PureMarketplacePlansUsageStatsFilter);

type MarketplacePlansUsageStatsFilterQuery =
  MarketplacePlansUsageStatsListData['query'];

export const selectMarketplacePlansUsageStatsFilter = createSelector<
  RootState,
  Partial<MarketplacePlansUsageStatsFilterFormData>,
  MarketplacePlansUsageStatsFilterQuery
>(getFormValues(MarketplacePlansUsageStatsFilterFormId), (values) => {
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
});
