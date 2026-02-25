// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplacePlanComponentsListData,
  ProviderOfferingDetails,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PurePriceListFilter: FunctionComponent<{}> = () => (
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

export const PriceListFilterFormId = 'PriceListFilter';

interface PriceListFilterFormData {
  offering: ProviderOfferingDetails;
}

export const PriceListFilter = reduxForm<PriceListFilterFormData, {}>({
  form: PriceListFilterFormId,
  destroyOnUnmount: false,
})(PurePriceListFilter);

export const selectPriceListFilter = createSelector<
  RootState,
  Partial<PriceListFilterFormData>,
  MarketplacePlanComponentsListData['query']
>(getFormValues(PriceListFilterFormId), (values) => {
  const filter: MarketplacePlanComponentsListData['query'] = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
});
