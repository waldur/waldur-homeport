// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { UserGroupInvitationsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter } from '@/table';

export const UserGroupInvitationsFilter: FunctionComponent<{}> = () => (
  <BooleanFilter
    title={translate('Group invitations')}
    name="is_active"
    badgeValue={(value) =>
      value ? translate('Only active') : translate('All')
    }
    ellipsis={false}
    parse={(v) => v || undefined}
  />
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
