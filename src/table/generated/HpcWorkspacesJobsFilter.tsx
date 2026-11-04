// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  HpcJobTimeWindowEnum,
  HpcWorkspacesJobsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const HpcJobTimeWindowOptions: HpcJobTimeWindowOption[] = [
  {
    label: translate('Last hour'),
    value: '1h',
  },
  {
    label: translate('Last 8 hours'),
    value: '8h',
  },
  {
    label: translate('Last 24 hours'),
    value: '24h',
  },
  {
    label: translate('Last 3 days'),
    value: '3d',
  },
  {
    label: translate('Last 7 days'),
    value: '7d',
  },
];
export interface HpcJobTimeWindowOption {
  label: string;
  value: HpcJobTimeWindowEnum;
}

export const HpcWorkspacesJobsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Time period')}
    name="time_window"
    getValueLabel={(value: HpcJobTimeWindowOption) => value?.label}
    options={HpcJobTimeWindowOptions}
    getOptionValue={(option: HpcJobTimeWindowOption) => String(option.value)}
    getOptionLabel={(option: HpcJobTimeWindowOption) => option.label}
    isClearable={true}
    placeholder={translate('Time period')}
  />
);

export const HpcWorkspacesJobsFilterFormId = 'HpcWorkspacesJobsFilter';

export interface HpcWorkspacesJobsFilterFormData {
  time_window: HpcJobTimeWindowOption;
}

type HpcWorkspacesJobsFilterQuery = HpcWorkspacesJobsListData['query'];

export const selectHpcWorkspacesJobsFilter = (
  values?: Partial<HpcWorkspacesJobsFilterFormData>,
): HpcWorkspacesJobsFilterQuery => {
  const filter: HpcWorkspacesJobsFilterQuery = {} as any;
  if (values) {
    if (values.time_window) {
      filter.time_window = values.time_window.value;
    }
  }
  return filter;
};
