// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  OpenportalRemoteProjectsListData,
  RemoteProjectStateEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const RemoteProjectStateOptions: RemoteProjectStateOption[] = [
  {
    label: translate('Active'),
    value: 'active',
  },
  {
    label: translate('Deleted'),
    value: 'deleted',
  },
  {
    label: translate('Error'),
    value: 'error',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Stale'),
    value: 'stale',
  },
];
export interface RemoteProjectStateOption {
  label: string;
  value: RemoteProjectStateEnum;
}

export const OpenportalRemoteProjectsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('State')}
    name="state"
    getValueLabel={(value: RemoteProjectStateOption) => value?.label}
    options={RemoteProjectStateOptions}
    getOptionValue={(option: RemoteProjectStateOption) => String(option.value)}
    getOptionLabel={(option: RemoteProjectStateOption) => option.label}
    isClearable={true}
    isMulti={true}
    placeholder={translate('State')}
  />
);

export const OpenportalRemoteProjectsFilterFormId =
  'OpenportalRemoteProjectsFilter';

export interface OpenportalRemoteProjectsFilterFormData {
  state: RemoteProjectStateOption[];
}

type OpenportalRemoteProjectsFilterQuery =
  OpenportalRemoteProjectsListData['query'];

export const selectOpenportalRemoteProjectsFilter = (
  values?: Partial<OpenportalRemoteProjectsFilterFormData>,
): OpenportalRemoteProjectsFilterQuery => {
  const filter: OpenportalRemoteProjectsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
};
