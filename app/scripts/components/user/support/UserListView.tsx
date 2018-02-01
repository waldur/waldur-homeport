import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { UserFilter } from './UserFilter';
import UserListContainer from './UserListContainer';

const PureUserListView = () => {
  return (
    <div>
      <div className="col-md-9">
        <div className="ibox-content">
          <UserListContainer />
        </div>
      </div>
      <div className="col-md-3">
        <UserFilter />
      </div>
    </div>
    );
};

export default connectAngularComponent(PureUserListView);
