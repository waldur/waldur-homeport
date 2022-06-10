import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { useUserTabs } from './constants';
import { IdentityProviderContainer } from './support/IdentityProviderContainer';
import { UserDeleteAccount } from './support/UserDeleteAccount';
import { UserEditFormContainer } from './support/UserEditFormContainer';

import './user-edit.scss';

export const UserManage: FunctionComponent = () => {
  useTitle(translate('Settings'));
  useUserTabs();

  const user = useSelector(getUser) as UserDetails;
  if (!user) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <IdentityProviderContainer user={user} />
      <UserEditFormContainer user={user} />
      <UserDeleteAccount user={user} />
    </>
  );
};
