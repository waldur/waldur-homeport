// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { UserGroupInvitationsListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { RootState } from '@/store/reducers';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureUserGroupInvitationsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Group invitations')}
    name="is_active"
    badgeValue={(value) =>
      value ? translate('Only active') : translate('All')
    }
    ellipsis={false}
  >
    <Field
      name="is_active"
      component={AwesomeCheckboxField}
      label={translate('Group invitations')}
      parse={(v) => v || undefined}
    />
  </TableFilterItem>
);

export const UserGroupInvitationsFilterFormId = 'UserGroupInvitationsFilter';

interface UserGroupInvitationsFilterFormData {
  is_active: boolean;
}

export const UserGroupInvitationsFilter = reduxForm<
  UserGroupInvitationsFilterFormData,
  {}
>({
  form: UserGroupInvitationsFilterFormId,
  destroyOnUnmount: false,
})(PureUserGroupInvitationsFilter);

type UserGroupInvitationsFilterQuery = UserGroupInvitationsListData['query'];

export const selectUserGroupInvitationsFilter = createSelector<
  RootState,
  Partial<UserGroupInvitationsFilterFormData>,
  UserGroupInvitationsFilterQuery
>(getFormValues(UserGroupInvitationsFilterFormId), (values) => {
  const filter: UserGroupInvitationsFilterQuery = {} as any;
  if (values) {
    if (values.is_active) {
      filter.is_active = values.is_active;
    }
  }
  return filter;
});
