// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  AdminArrowCustomerMappingsListData,
  Customer,
  customersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, BooleanFilter, StringFilter } from '@/table';

export const AdminArrowCustomerMappingsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Waldur Organization')}
      name="waldur_customer_uuid"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Waldur Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <StringFilter
      title={translate('Arrow Reference')}
      name="arrow_reference"
      placeholder={translate('Arrow Reference')}
    />
    <BooleanFilter
      title={translate('Active')}
      name="is_active"
      badgeValue={(value) => (value ? translate('Active') : translate('All'))}
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const AdminArrowCustomerMappingsFilterFormId =
  'AdminArrowCustomerMappingsFilter';

export interface AdminArrowCustomerMappingsFilterFormData {
  waldur_customer_uuid: Customer;
  arrow_reference: string;
  is_active: boolean;
}

type AdminArrowCustomerMappingsFilterQuery =
  AdminArrowCustomerMappingsListData['query'];

export const selectAdminArrowCustomerMappingsFilter = (
  values?: Partial<AdminArrowCustomerMappingsFilterFormData>,
): AdminArrowCustomerMappingsFilterQuery => {
  const filter: AdminArrowCustomerMappingsFilterQuery = {} as any;
  if (values) {
    if (values.waldur_customer_uuid) {
      filter.waldur_customer_uuid = values.waldur_customer_uuid.uuid;
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
