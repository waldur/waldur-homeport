// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  FinancialReportsListData,
  ServiceProvider,
  marketplaceServiceProvidersList,
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

export const AccountingIsRunningOptions: AccountingIsRunningOption[] = [
  {
    label: translate('Not running accounting'),
    value: false,
  },
  {
    label: translate('Running accounting'),
    value: true,
  },
  {
    label: translate('All'),
    value: 'undefined',
  },
];
export interface AccountingIsRunningOption {
  label: string;
  value: any;
}

const PureFinancialReportsFilter: FunctionComponent<
  FinancialReportsFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Service provider')}
      name="customer"
      getValueLabel={(value: ServiceProvider) => value?.customer_name}
    >
      <Field
        name="customer"
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
      title={translate('Accounting period')}
      name="accounting_period"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="accounting_period"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Accounting period')}
            options={props.accountingPeriods}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Accounting is running')}
      name="accounting_is_running"
      getValueLabel={(value: AccountingIsRunningOption) => value?.label}
    >
      <Field
        name="accounting_is_running"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Show with running accounting')}
            options={AccountingIsRunningOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: AccountingIsRunningOption) =>
              String(option.value)
            }
            getOptionLabel={(option: AccountingIsRunningOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const FinancialReportsFilterFormId = 'FinancialReportsFilter';

interface FinancialReportsFilterProps {
  accountingPeriods?: any[];
}

interface FinancialReportsFilterFormData {
  customer: ServiceProvider;
  accounting_period: any;
  accounting_is_running: AccountingIsRunningOption;
}

export const FinancialReportsFilter = reduxForm<
  FinancialReportsFilterFormData,
  FinancialReportsFilterProps
>({
  form: FinancialReportsFilterFormId,
  destroyOnUnmount: false,
})(PureFinancialReportsFilter);

type FinancialReportsFilterQuery = FinancialReportsListData['query'];

export const selectFinancialReportsFilter = createSelector<
  RootState,
  Partial<FinancialReportsFilterFormData>,
  FinancialReportsFilterQuery
>(getFormValues(FinancialReportsFilterFormId), (values) => {
  const filter: FinancialReportsFilterQuery = {} as any;
  if (values) {
    if (values.customer) {
      filter.customer_uuid = values.customer.customer_uuid;
    }
    if (values.accounting_period) {
      Object.assign(filter, values.accounting_period.value);
    }
    if (values.accounting_is_running) {
      filter.accounting_is_running = values.accounting_is_running.value;
    }
  }
  return filter;
});
