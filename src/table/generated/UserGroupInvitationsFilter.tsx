// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { UserGroupInvitationsListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const UserGroupInvitationsFilter: FunctionComponent<{}> = () => (
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

export interface UserGroupInvitationsFilterFormData {
  is_active: boolean;
}

type UserGroupInvitationsFilterQuery = UserGroupInvitationsListData['query'];

export const selectUserGroupInvitationsFilter = (
  values?: Partial<UserGroupInvitationsFilterFormData>,
): UserGroupInvitationsFilterQuery => {
  const filter: UserGroupInvitationsFilterQuery = {} as any;
  if (values) {
    if (values.is_active) {
      filter.is_active = values.is_active;
    }
  }
  return filter;
};
