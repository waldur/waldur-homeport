import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

const PureUserListView = () => (
  <>
    <div className="ibox-content m-b-sm border-bottom">
      <UserFilter />
    </div>
    <div className="ibox-content">
      <UserList />
    </div>
  </>
);

export default connectAngularComponent(PureUserListView);
