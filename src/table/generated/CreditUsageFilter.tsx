// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  InvoiceItemsListData,
  PublicOfferingDetails,
  Resource,
  marketplacePublicOfferingsList,
  marketplaceResourcesList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureCreditUsageFilter: FunctionComponent<CreditUsageFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      getValueLabel={(value: PublicOfferingDetails) => value?.name}
    >
      <Field
        name="offering"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Offering')}
            loadOptions={createSelectFetcher(
              marketplacePublicOfferingsList,
              'query',
            )}
            defaultOptions
            getOptionValue={(option: PublicOfferingDetails) =>
              String(option.uuid || '')
            }
            getOptionLabel={(option: PublicOfferingDetails) =>
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
    <TableFilterItem
      title={translate('Resource')}
      name="resource"
      getValueLabel={(value: Resource) => value?.name}
    >
      <Field
        name="resource"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Resource')}
            loadOptions={createSelectFetcher(
              marketplaceResourcesList,
              'query',
              { customer_uuid: props.customerUUID },
            )}
            defaultOptions
            getOptionValue={(option: Resource) =>
              String(option.resource_uuid || '')
            }
            getOptionLabel={(option: Resource) => String(option.name || '')}
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
      title={translate('Year')}
      name="year"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="year"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Year')}
            options={props.yearOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Month')}
      name="month"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="month"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Month')}
            options={props.monthOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const CreditUsageFilterFormId = 'CreditUsageFilter';

interface CreditUsageFilterProps {
  customerUUID?: any;
  monthOptions?: any[];
  yearOptions?: any[];
}

interface CreditUsageFilterFormData {
  offering: PublicOfferingDetails;
  resource: Resource;
  year: any;
  month: any;
}

export const CreditUsageFilter = reduxForm<
  CreditUsageFilterFormData,
  CreditUsageFilterProps
>({
  form: CreditUsageFilterFormId,
  destroyOnUnmount: false,
})(PureCreditUsageFilter);

type CreditUsageFilterQuery = InvoiceItemsListData['query'];

export const selectCreditUsageFilter = createSelector<
  RootState,
  Partial<CreditUsageFilterFormData>,
  CreditUsageFilterQuery
>(getFormValues(CreditUsageFilterFormId), (values) => {
  const filter: CreditUsageFilterQuery = {} as any;
  if (values) {
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
    if (values.resource) {
      filter.resource_uuid = values.resource.resource_uuid;
    }
    if (values.year) {
      filter.start_year = values.year.value;
    }
    if (values.month) {
      filter.start_month = values.month.value;
    }
  }
  return filter;
});
