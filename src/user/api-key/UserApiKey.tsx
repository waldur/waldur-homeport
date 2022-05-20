import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { AuthenticationEvents } from './AuthenticationEvents';
import { UserEditTokenContainer } from './UserEditTokenContainer';

export const UserApiKey: FunctionComponent = () => {
  useTitle(translate('API key'));
  const user = useSelector(getUser) as UserDetails;
  if (!user) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <UserEditTokenContainer user={user} />
      <AuthenticationEvents user={user} />
    </>
  );
};
