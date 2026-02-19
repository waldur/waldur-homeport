// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  InvoicesItemsRetrieveData,
  Project,
  PublicOfferingDetails,
  ServiceProvider,
  marketplacePublicOfferingsList,
  marketplaceServiceProvidersList,
  projectsList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const BooleanEnum = [
  {
    label: translate('No'),
    value: false,
  },
  {
    label: translate('Yes'),
    value: true,
  },
  {
    label: translate('All'),
  },
];
interface BooleanEnumOption {
  label: string;
  value: any;
}

export const PureInvoicesItemsFilter: FunctionComponent<
  InvoicesItemsFilterProps
> = (props) => (
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
            getOptionValue={(option: ServiceProvider) => option.uuid}
            getOptionLabel={(option: ServiceProvider) => option.customer_name}
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
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
    >
      <Field
        name="project"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Project')}
            loadOptions={createSelectFetcher(projectsList, 'query', {
              customer: props.customerUuid,
            })}
            defaultOptions
            getOptionValue={(option: Project) => option.uuid}
            getOptionLabel={(option: Project) => option.name}
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
              { state: 'Active' },
            )}
            defaultOptions
            getOptionValue={(option: PublicOfferingDetails) => option.uuid}
            getOptionLabel={(option: PublicOfferingDetails) => option.name}
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
      title={translate('Conceal compensation items')}
      name="conceal_compensation_items"
      getValueLabel={(value) => value?.label}
    >
      <Field
        name="conceal_compensation_items"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Conceal compensation items')}
            options={BooleanEnum}
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

export const InvoicesItemsFilterFormId = 'InvoicesItemsFilter';

interface InvoicesItemsFilterProps {
  customerUuid: any;
}

interface InvoicesItemsFilterFormData {
  provider: ServiceProvider;
  project: Project;
  offering: PublicOfferingDetails;
  conceal_compensation_items: BooleanEnumOption;
}

export const InvoicesItemsFilter = reduxForm<
  InvoicesItemsFilterFormData,
  InvoicesItemsFilterProps
>({
  form: InvoicesItemsFilterFormId,
  destroyOnUnmount: false,
})(PureInvoicesItemsFilter);

export const selectInvoicesItemsFilter = createSelector(
  getFormValues(InvoicesItemsFilterFormId),
  (values: InvoicesItemsFilterFormData | undefined) => {
    const filter: InvoicesItemsRetrieveData['query'] = {};
    if (values) {
      if (values.provider) {
        filter.provider_uuid = values.provider.uuid;
      }
      if (values.project) {
        filter.project_uuid = values.project.uuid;
      }
      if (values.offering) {
        filter.offering_uuid = values.offering.uuid;
      }
      if (values.conceal_compensation_items) {
        filter.conceal_compensation_items =
          values.conceal_compensation_items.value;
      }
    }
    return filter;
  },
);
