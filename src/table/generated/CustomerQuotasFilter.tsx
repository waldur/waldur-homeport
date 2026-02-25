// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  CustomerQuotasListData,
  CustomerQuotasQuotaNameEnum,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const CustomerQuotasQuotaNameEnumChoices: CustomerQuotasQuotaNameEnumChoicesOption[] =
  [
    {
      label: translate('Resources'),
      value: 'estimated_price',
    },
    {
      label: translate('Estimated price per month'),
      value: 'nc_resource_count',
    },
    {
      label: translate('VPC vCPU'),
      value: 'os_cpu_count',
    },
    {
      label: translate('VPC RAM'),
      value: 'os_ram_size',
    },
    {
      label: translate('VPC block storage size'),
      value: 'os_storage_size',
    },
    {
      label: translate('VPC floating IP count'),
      value: 'vpc_cpu_count',
    },
    {
      label: translate('VPC instance count'),
      value: 'vpc_floating_ip_count',
    },
    {
      label: translate('Cloud vCPU'),
      value: 'vpc_instance_count',
    },
    {
      label: translate('Cloud RAM'),
      value: 'vpc_ram_size',
    },
    {
      label: translate('Cloud block storage size'),
      value: 'vpc_storage_size',
    },
  ];
export interface CustomerQuotasQuotaNameEnumChoicesOption {
  label: string;
  value: CustomerQuotasQuotaNameEnum;
}

const PureCustomerQuotasFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Quota')}
    name="quota_name"
    hideRemoveButton={true}
    getValueLabel={(value: CustomerQuotasQuotaNameEnumChoicesOption) =>
      value?.label
    }
  >
    <Field
      name="quota_name"
      validate={[required]}
      component={(fieldProps) => (
        <Select
          placeholder={translate('Quota')}
          options={CustomerQuotasQuotaNameEnumChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: CustomerQuotasQuotaNameEnumChoicesOption) =>
            String(option.value)
          }
          getOptionLabel={(option: CustomerQuotasQuotaNameEnumChoicesOption) =>
            option.label
          }
          isClearable={false}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const CustomerQuotasFilterFormId = 'CustomerQuotasFilter';

interface CustomerQuotasFilterFormData {
  quota_name: CustomerQuotasQuotaNameEnumChoicesOption;
}

export const CustomerQuotasFilter = reduxForm<CustomerQuotasFilterFormData, {}>(
  {
    form: CustomerQuotasFilterFormId,
    destroyOnUnmount: false,
    initialValues: {
      quota_name: { label: translate('Resources'), value: 'estimated_price' },
    },
  },
)(PureCustomerQuotasFilter);

type CustomerQuotasFilterQuery = CustomerQuotasListData['query'];

export const selectCustomerQuotasFilter = createSelector<
  RootState,
  Partial<CustomerQuotasFilterFormData>,
  CustomerQuotasFilterQuery
>(getFormValues(CustomerQuotasFilterFormId), (values) => {
  const filter: CustomerQuotasFilterQuery = {} as any;
  if (values) {
    if (values.quota_name) {
      filter.quota_name = values.quota_name.value;
    }
  }
  return filter;
});
