import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { UserPermissionRequestsList } from '@waldur/user/UserPermissionRequestsList';
import { UserPermissionRequestsListFilter } from '@waldur/user/UserPermissionRequestsListFilter';

export const UserPermissionRequestsListContainer: FunctionComponent = () => {
  useTitle(translate('Permission requests'));
  return (
    <UserPermissionRequestsList
      filters={<UserPermissionRequestsListFilter />}
    />
  );
};
