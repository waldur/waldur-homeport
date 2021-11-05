import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { UserPermissionsList } from '@waldur/user/UserPermissionsList';
import { UserPermissionsListFilter } from '@waldur/user/UserPermissionsListFilter';

export const UserPermissionsListContainer: FunctionComponent = () => {
  useTitle(translate('Permissions'));
  return (
    <>
      <UserPermissionsListFilter />
      <UserPermissionsList />
    </>
  );
};
