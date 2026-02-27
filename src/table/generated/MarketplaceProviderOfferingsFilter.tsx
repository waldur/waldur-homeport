// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplaceProviderOfferingsListData,
  OfferingState,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

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

const PureMarketplaceProviderOfferingsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(value: OfferingStateOption) => value?.label}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={OfferingStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: OfferingStateOption) => String(option.value)}
          getOptionLabel={(option: OfferingStateOption) => option.label}
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const MarketplaceProviderOfferingsFilterFormId =
  'MarketplaceProviderOfferingsFilter';

interface MarketplaceProviderOfferingsFilterFormData {
  state: OfferingStateOption[];
}

export const MarketplaceProviderOfferingsFilter = reduxForm<
  MarketplaceProviderOfferingsFilterFormData,
  {}
>({
  form: MarketplaceProviderOfferingsFilterFormId,
  destroyOnUnmount: false,
  initialValues: {
    state: [
      { label: translate('Draft'), value: 'Draft' },
      { label: translate('Active'), value: 'Active' },
    ],
  },
})(PureMarketplaceProviderOfferingsFilter);

type MarketplaceProviderOfferingsFilterQuery =
  MarketplaceProviderOfferingsListData['query'];

export const selectMarketplaceProviderOfferingsFilter = createSelector<
  RootState,
  Partial<MarketplaceProviderOfferingsFilterFormData>,
  MarketplaceProviderOfferingsFilterQuery
>(getFormValues(MarketplaceProviderOfferingsFilterFormId), (values) => {
  const filter: MarketplaceProviderOfferingsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
});
