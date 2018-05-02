import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

const PureUserListView = () => (
  <div className="ibox-content">
    <UserFilter />
    <hr/>
    <UserList />
  </div>
);

export default connectAngularComponent(PureUserListView);
