import * as React from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

export const UserListView = () => {
  useTitle(translate('Users'));
  return (
    <>
      <div className="ibox-content m-b-sm border-bottom">
        <UserFilter />
      </div>
      <div className="ibox-content">
        <UserList />
      </div>
    </>
  );
};
