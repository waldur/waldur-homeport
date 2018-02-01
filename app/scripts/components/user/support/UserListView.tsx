import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

const PureUserListView = () => (
  <>
    <div className="col-md-9">
      <div className="ibox-content">
        <UserList />
      </div>
    </div>
    <div className="col-md-3">
      <UserFilter />
    </div>
  </>
);

export default connectAngularComponent(PureUserListView);
