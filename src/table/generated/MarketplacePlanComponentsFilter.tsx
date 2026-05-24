// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  MarketplacePlanComponentsListData,
  ProviderOfferingDetails,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { AsyncSelect } from '@/form/select';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const MarketplacePlanComponentsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Offering')}
    name="offering"
    getValueLabel={(value: ProviderOfferingDetails) => value?.name}
  >
    <Field
      name="offering"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Offering')}
          loadOptions={createLoadOptions(
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
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
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
