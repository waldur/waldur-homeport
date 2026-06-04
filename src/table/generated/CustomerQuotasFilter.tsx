// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  CustomerQuotasListData,
  CustomerQuotasQuotaNameEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const CustomerQuotasQuotaNameOptions: CustomerQuotasQuotaNameOption[] = [
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
export interface CustomerQuotasQuotaNameOption {
  label: string;
  value: CustomerQuotasQuotaNameEnum;
}

export const CustomerQuotasFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Quota')}
    name="quota_name"
    getValueLabel={(value: CustomerQuotasQuotaNameOption) => value?.label}
    placeholder={translate('Quota')}
    options={CustomerQuotasQuotaNameOptions}
    getOptionValue={(option: CustomerQuotasQuotaNameOption) =>
      String(option.value)
    }
    getOptionLabel={(option: CustomerQuotasQuotaNameOption) => option.label}
    isClearable={true}
  />
);

export const CustomerQuotasFilterFormId = 'CustomerQuotasFilter';

export interface CustomerQuotasFilterFormData {
  quota_name: CustomerQuotasQuotaNameOption;
}

export const CustomerQuotasFilterInitialValues = {
  quota_name: { label: translate('Resources'), value: 'estimated_price' },
};

type CustomerQuotasFilterQuery = CustomerQuotasListData['query'];

export const selectCustomerQuotasFilter = (
  values?: Partial<CustomerQuotasFilterFormData>,
): CustomerQuotasFilterQuery => {
  const filter: CustomerQuotasFilterQuery = {} as any;
  if (values) {
    if (values.quota_name) {
      filter.quota_name = values.quota_name.value;
    }
  }
  return filter;
};
