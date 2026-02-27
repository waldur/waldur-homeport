// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  RemoteProjectUpdateRequestStateEnum,
  UserPermissionRequestsListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

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

const PureUserPermissionRequestsFilter: FunctionComponent<{}> = () => (
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
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const UserPermissionRequestsFilterFormId =
  'UserPermissionRequestsFilter';

interface UserPermissionRequestsFilterFormData {
  state: UserPermissionRequestsRemoteProjectUpdateRequestStateOption[];
}

export const UserPermissionRequestsFilter = reduxForm<
  UserPermissionRequestsFilterFormData,
  {}
>({
  form: UserPermissionRequestsFilterFormId,
  destroyOnUnmount: false,
  initialValues: { state: [{ value: 'pending', label: translate('Pending') }] },
})(PureUserPermissionRequestsFilter);

type UserPermissionRequestsFilterQuery =
  UserPermissionRequestsListData['query'];

export const selectUserPermissionRequestsFilter = createSelector<
  RootState,
  Partial<UserPermissionRequestsFilterFormData>,
  UserPermissionRequestsFilterQuery
>(getFormValues(UserPermissionRequestsFilterFormId), (values) => {
  const filter: UserPermissionRequestsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
});
