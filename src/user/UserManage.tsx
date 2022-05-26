import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getUser } from '@waldur/workspace/selectors';

import { useUserTabs } from './constants';
import { UserEditContainer } from './support/UserEditContainer';

export const UserManage: FunctionComponent = () => {
  useTitle(translate('Manage'));
  useUserTabs();
  const user = useSelector(getUser);
  if (!user) {
    return <LoadingSpinner />;
  }
  return <UserEditContainer user={user} />;
};
