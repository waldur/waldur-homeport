import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { UserPermissionRequestsList } from '@waldur/user/UserPermissionRequestsList';
import { UserPermissionRequestsListFilter } from '@waldur/user/UserPermissionRequestsListFilter';

import { useUserTabs } from './constants';

export const UserPermissionRequestsListContainer: FunctionComponent = () => {
  useTitle(translate('Permission requests'));
  useUserTabs();
  return (
    <UserPermissionRequestsList
      filters={<UserPermissionRequestsListFilter />}
    />
  );
};
