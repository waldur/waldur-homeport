import * as React from 'react';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

export const UserListView = () => (
  <>
    <div className="ibox-content m-b-sm border-bottom">
      <UserFilter />
    </div>
    <div className="ibox-content">
      <UserList />
    </div>
  </>
);
