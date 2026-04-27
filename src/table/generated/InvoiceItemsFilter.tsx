// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  InvoiceItemsListData,
  Project,
  ProviderOfferingDetails,
  customersList,
  marketplaceProviderOfferingsList,
  projectsList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureInvoiceItemsFilter: FunctionComponent<InvoiceItemsFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
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
      title={translate('Period')}
      name="accounting_period"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="accounting_period"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Period')}
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
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
    >
      <Field
        name="project"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Project')}
            loadOptions={createSelectFetcher(projectsList, 'query')}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
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
              'query',
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

export const InvoiceItemsFilterFormId = 'InvoiceItemsFilter';

interface InvoiceItemsFilterProps {
  accountingPeriods?: any[];
}

interface InvoiceItemsFilterFormData {
  organization: Customer;
  accounting_period: any;
  project: Project;
  offering: ProviderOfferingDetails;
}

export const InvoiceItemsFilter = reduxForm<
  InvoiceItemsFilterFormData,
  InvoiceItemsFilterProps
>({
  form: InvoiceItemsFilterFormId,
  destroyOnUnmount: false,
})(PureInvoiceItemsFilter);

type InvoiceItemsFilterQuery = InvoiceItemsListData['query'];

export const selectInvoiceItemsFilter = createSelector<
  RootState,
  Partial<InvoiceItemsFilterFormData>,
  InvoiceItemsFilterQuery
>(getFormValues(InvoiceItemsFilterFormId), (values) => {
  const filter: InvoiceItemsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.accounting_period) {
      Object.assign(filter, values.accounting_period.value);
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
});
