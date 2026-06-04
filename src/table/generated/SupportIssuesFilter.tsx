// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { SupportIssuesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const StatusOptions: StatusOption[] = [
  {
    label: translate('Closed'),
    value: 'Closed',
  },
  {
    label: translate('Open'),
    value: 'Open',
  },
  {
    label: translate('Resolved'),
    value: 'Resolved',
  },
  {
    label: translate('Waiting for support'),
    value: 'Waiting for support',
  },
];
export interface StatusOption {
  label: string;
  value: string;
}

export const SupportIssuesFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Status')}
    name="status"
    getValueLabel={(value: StatusOption) => value?.label}
    placeholder={translate('Status')}
    options={StatusOptions}
    getOptionValue={(option: StatusOption) => String(option.value)}
    getOptionLabel={(option: StatusOption) => option.label}
    isClearable={true}
  />
);

export const SupportIssuesFilterFormId = 'SupportIssuesFilter';

export interface SupportIssuesFilterFormData {
  status: StatusOption;
}

type SupportIssuesFilterQuery = SupportIssuesListData['query'];

export const selectSupportIssuesFilter = (
  values?: Partial<SupportIssuesFilterFormData>,
): SupportIssuesFilterQuery => {
  const filter: SupportIssuesFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.value;
    }
  }
  return filter;
};
