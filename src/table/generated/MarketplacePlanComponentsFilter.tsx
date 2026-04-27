// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplacePlanComponentsListData,
  ProviderOfferingDetails,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureMarketplacePlanComponentsFilter: FunctionComponent<{}> = () => (
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
);

export const MarketplacePlanComponentsFilterFormId =
  'MarketplacePlanComponentsFilter';

interface MarketplacePlanComponentsFilterFormData {
  offering: ProviderOfferingDetails;
}

export const MarketplacePlanComponentsFilter = reduxForm<
  MarketplacePlanComponentsFilterFormData,
  {}
>({
  form: MarketplacePlanComponentsFilterFormId,
  destroyOnUnmount: false,
})(PureMarketplacePlanComponentsFilter);

type MarketplacePlanComponentsFilterQuery =
  MarketplacePlanComponentsListData['query'];

export const selectMarketplacePlanComponentsFilter = createSelector<
  RootState,
  Partial<MarketplacePlanComponentsFilterFormData>,
  MarketplacePlanComponentsFilterQuery
>(getFormValues(MarketplacePlanComponentsFilterFormId), (values) => {
  const filter: MarketplacePlanComponentsFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
});
