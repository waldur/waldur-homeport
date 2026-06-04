// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  RemoteProjectUpdateRequestStateEnum,
  UserPermissionRequestsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const UserPermissionRequestsRemoteProjectUpdateRequestStateOptions: UserPermissionRequestsRemoteProjectUpdateRequestStateOption[] =
  [
    {
      label: translate('Approved'),
      value: 'approved',
    },
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Rejected'),
      value: 'rejected',
    },
  ];
export interface UserPermissionRequestsRemoteProjectUpdateRequestStateOption {
  label: string;
  value: RemoteProjectUpdateRequestStateEnum;
}

export const UserPermissionRequestsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('State')}
    name="state"
    getValueLabel={(
      value: UserPermissionRequestsRemoteProjectUpdateRequestStateOption,
    ) => value?.label}
    placeholder={translate('State')}
    options={UserPermissionRequestsRemoteProjectUpdateRequestStateOptions}
    getOptionValue={(
      option: UserPermissionRequestsRemoteProjectUpdateRequestStateOption,
    ) => String(option.value)}
    getOptionLabel={(
      option: UserPermissionRequestsRemoteProjectUpdateRequestStateOption,
    ) => option.label}
    isClearable={true}
    isMulti={true}
  />
);

export const UserPermissionRequestsFilterFormId =
  'UserPermissionRequestsFilter';

export interface UserPermissionRequestsFilterFormData {
  state: UserPermissionRequestsRemoteProjectUpdateRequestStateOption[];
}

export const UserPermissionRequestsFilterInitialValues = {
  state: [{ value: 'pending', label: translate('Pending') }],
};

type UserPermissionRequestsFilterQuery =
  UserPermissionRequestsListData['query'];

export const selectUserPermissionRequestsFilter = (
  values?: Partial<UserPermissionRequestsFilterFormData>,
): UserPermissionRequestsFilterQuery => {
  const filter: UserPermissionRequestsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
};
