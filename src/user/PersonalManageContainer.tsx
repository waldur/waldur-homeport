import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { UserManageContainer } from '@waldur/user/UserManageContainer';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

export const PersonalManageContainer: FunctionComponent = () => {
  const user = useSelector(getUser) as UserDetails;
  if (!user) {
    return <LoadingSpinner />;
  }
  return <UserManageContainer isPersonal />;
};
