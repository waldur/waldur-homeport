import * as React from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getUser } from '@waldur/workspace/selectors';

import { UserEditContainer } from './support/UserEditContainer';

export const UserManage = () => {
  useTitle(translate('Manage'));
  const user = useSelector(getUser);
  if (!user) {
    return <LoadingSpinner />;
  }
  return (
    <div className="row wrapper p-b-xl">
      <div className="col-lg-10">
        <UserEditContainer user={user} />
      </div>
    </div>
  );
};
