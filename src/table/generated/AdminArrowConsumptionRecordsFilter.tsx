// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  AdminArrowConsumptionRecordsListData,
  Customer,
  customersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const IsFinalizedOptions: IsFinalizedOption[] = [
  {
    label: translate('Pending'),
    value: false,
  },
  {
    label: translate('Finalized'),
    value: true,
  },
];
export interface IsFinalizedOption {
  label: string;
  value: boolean;
}

export const AdminArrowConsumptionRecordsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Status')}
      name="is_finalized"
      getValueLabel={(value: IsFinalizedOption) => value?.label}
      placeholder={translate('Status')}
      options={IsFinalizedOptions}
      getOptionValue={(option: IsFinalizedOption) => String(option.value)}
      getOptionLabel={(option: IsFinalizedOption) => option.label}
      isClearable={true}
    />
  </>
);

export const AdminArrowConsumptionRecordsFilterFormId =
  'AdminArrowConsumptionRecordsFilter';

export interface AdminArrowConsumptionRecordsFilterFormData {
  organization: Customer;
  is_finalized: IsFinalizedOption;
}

type AdminArrowConsumptionRecordsFilterQuery =
  AdminArrowConsumptionRecordsListData['query'];

export const selectAdminArrowConsumptionRecordsFilter = (
  values?: Partial<AdminArrowConsumptionRecordsFilterFormData>,
): AdminArrowConsumptionRecordsFilterQuery => {
  const filter: AdminArrowConsumptionRecordsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.is_finalized) {
      filter.is_finalized = values.is_finalized.value;
    }
  }
  return filter;
};
