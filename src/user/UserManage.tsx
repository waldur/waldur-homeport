import * as React from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { connectAngularComponent } from '@waldur/store/connect';
import { getUser } from '@waldur/workspace/selectors';

import { UserEditContainer } from './support/UserEditContainer';

const UserManage = () => {
  const user = useSelector(getUser);
  if (!user) {
    return <LoadingSpinner/>;
  }
  return (
    <div className="row wrapper p-b-xl">
      <div className="col-lg-10">
        <UserEditContainer user={user}/>
      </div>
    </div>
  );
};

export default connectAngularComponent(UserManage);
