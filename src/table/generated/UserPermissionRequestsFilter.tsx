// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  RemoteProjectUpdateRequestStateEnum,
  UserPermissionRequestsListData,
} from 'waldur-js-client';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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
  <TableFilterItem
    title={translate('State')}
    name="state"
    getValueLabel={(
      value: UserPermissionRequestsRemoteProjectUpdateRequestStateOption,
    ) => value?.label}
  >
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={UserPermissionRequestsRemoteProjectUpdateRequestStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(
            option: UserPermissionRequestsRemoteProjectUpdateRequestStateOption,
          ) => String(option.value)}
          getOptionLabel={(
            option: UserPermissionRequestsRemoteProjectUpdateRequestStateOption,
          ) => option.label}
          isClearable={true}
          isMulti={true}
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
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
