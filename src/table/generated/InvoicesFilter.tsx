// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { InvoiceStateEnum, InvoicesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const InvoiceStateOptions: InvoiceStateOption[] = [
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Created'),
    value: 'created',
  },
  {
    label: translate('Paid'),
    value: 'paid',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Pending finalization'),
    value: 'pending_finalization',
  },
];
export interface InvoiceStateOption {
  label: string;
  value: InvoiceStateEnum;
}

export const InvoicesFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('State')}
    name="state"
    getValueLabel={(value: InvoiceStateOption) => value?.label}
    placeholder={translate('State')}
    options={InvoiceStateOptions}
    getOptionValue={(option: InvoiceStateOption) => String(option.value)}
    getOptionLabel={(option: InvoiceStateOption) => option.label}
    isClearable={true}
    isMulti={true}
  />
);

export const InvoicesFilterFormId = 'InvoicesFilter';

export interface InvoicesFilterFormData {
  state: InvoiceStateOption[];
}

type InvoicesFilterQuery = InvoicesListData['query'];

export const selectInvoicesFilter = (
  values?: Partial<InvoicesFilterFormData>,
): InvoicesFilterQuery => {
  const filter: InvoicesFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
};
