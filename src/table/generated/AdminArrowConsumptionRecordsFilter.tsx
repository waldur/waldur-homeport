// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  AdminArrowConsumptionRecordsListData,
  Customer,
  customersList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

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
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Status')}
      name="is_finalized"
      getValueLabel={(value: IsFinalizedOption) => value?.label}
    >
      <Field
        name="is_finalized"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Status')}
            options={IsFinalizedOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: IsFinalizedOption) => String(option.value)}
            getOptionLabel={(option: IsFinalizedOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
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
