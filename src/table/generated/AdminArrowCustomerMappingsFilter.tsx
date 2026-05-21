// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  AdminArrowCustomerMappingsListData,
  Customer,
  customersList,
} from 'waldur-js-client';

import { StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { AsyncPaginate, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureAdminArrowCustomerMappingsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Waldur Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Waldur Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Arrow Reference')}
      name="arrow_reference"
    >
      <Field
        name="arrow_reference"
        component={StringField}
        placeholder={translate('Arrow Reference')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Active')}
      name="is_active"
      badgeValue={(value) => (value ? translate('Active') : translate('All'))}
      ellipsis={false}
    >
      <Field
        name="is_active"
        component={AwesomeCheckboxField}
        label={translate('Active')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
  </>
);

export const AdminArrowCustomerMappingsFilterFormId =
  'AdminArrowCustomerMappingsFilter';

export interface AdminArrowCustomerMappingsFilterFormData {
  organization: Customer;
  arrow_reference: string;
  is_active: boolean;
}

export const AdminArrowCustomerMappingsFilter =
  PureAdminArrowCustomerMappingsFilter;

type AdminArrowCustomerMappingsFilterQuery =
  AdminArrowCustomerMappingsListData['query'];

export const selectAdminArrowCustomerMappingsFilter = (
  values?: Partial<AdminArrowCustomerMappingsFilterFormData>,
): AdminArrowCustomerMappingsFilterQuery => {
  const filter: AdminArrowCustomerMappingsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.waldur_customer_uuid = values.organization.uuid;
    }
    if (values.arrow_reference) {
      filter.arrow_reference = values.arrow_reference;
    }
    if (values.is_active) {
      filter.is_active = values.is_active;
    }
  }
  return filter;
};
