// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { AdminArrowBillingSyncsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const StateOptions: StateOption[] = [
  {
    label: translate('Pending'),
    value: 1,
  },
  {
    label: translate('Syncing'),
    value: 2,
  },
  {
    label: translate('Synced'),
    value: 3,
  },
  {
    label: translate('Failed'),
    value: 4,
  },
];
export interface StateOption {
  label: string;
  value: number;
}

export const AdminArrowBillingSyncsFilter: FunctionComponent<
  AdminArrowBillingSyncsFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: StateOption) => value?.label}
      placeholder={translate('State')}
      options={StateOptions}
      getOptionValue={(option: StateOption) => String(option.value)}
      getOptionLabel={(option: StateOption) => option.label}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Period from')}
      name="report_period_from"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Period from')}
      options={props.billingPeriods}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Period to')}
      name="report_period_to"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Period to')}
      options={props.billingPeriods}
      isClearable={true}
    />
  </>
);

export const AdminArrowBillingSyncsFilterFormId =
  'AdminArrowBillingSyncsFilter';

interface AdminArrowBillingSyncsFilterProps {
  billingPeriods?: any[];
}

export interface AdminArrowBillingSyncsFilterFormData {
  state: StateOption;
  report_period_from: any;
  report_period_to: any;
}

type AdminArrowBillingSyncsFilterQuery =
  AdminArrowBillingSyncsListData['query'];

export const selectAdminArrowBillingSyncsFilter = (
  values?: Partial<AdminArrowBillingSyncsFilterFormData>,
): AdminArrowBillingSyncsFilterQuery => {
  const filter: AdminArrowBillingSyncsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.value;
    }
    if (values.report_period_from) {
      filter.report_period_from = values.report_period_from.value;
    }
    if (values.report_period_to) {
      filter.report_period_to = values.report_period_to.value;
    }
  }
  return filter;
};
