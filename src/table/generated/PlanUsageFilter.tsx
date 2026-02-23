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

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PurePlanUsageFilter: FunctionComponent<PlanUsageFilterProps> = (
  props,
) => (
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
            getOptionValue={
              props.getOptionValue ||
              ((option: ServiceProvider) => String(option.customer_uuid || ''))
            }
            getOptionLabel={
              props.getOptionLabel ||
              ((option: ServiceProvider) => String(option.customer_name || ''))
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
            getOptionValue={
              props.getOptionValue ||
              ((option: ProviderOfferingDetails) => String(option.uuid || ''))
            }
            getOptionLabel={
              props.getOptionLabel ||
              ((option: ProviderOfferingDetails) => String(option.name || ''))
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

export const PlanUsageFilterFormId = 'PlanUsageFilter';

interface PlanUsageFilterProps {
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => string;
}

interface PlanUsageFilterFormData {
  provider: ServiceProvider;
  offering: ProviderOfferingDetails;
}

export const PlanUsageFilter = reduxForm<
  PlanUsageFilterFormData,
  PlanUsageFilterProps
>({
  form: PlanUsageFilterFormId,
  destroyOnUnmount: false,
})(PurePlanUsageFilter);

export const selectPlanUsageFilter = createSelector(
  getFormValues(PlanUsageFilterFormId),
  (values: PlanUsageFilterFormData | undefined) => {
    const filter: MarketplacePlansUsageStatsListData['query'] = {};
    if (values) {
      if (values.provider) {
        filter.customer_provider_uuid = values.provider.customer_uuid;
      }
      if (values.offering) {
        filter.offering_uuid = values.offering.uuid;
      }
    }
    return filter;
  },
);
