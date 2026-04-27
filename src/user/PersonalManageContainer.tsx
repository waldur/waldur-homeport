import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { UserManageContainer } from '@/user/UserManageContainer';
import { useUser } from '@/workspace/hooks';

export const PersonalManageContainer: FunctionComponent = () => {
  const user = useUser();
  if (!user) {
    return <LoadingSpinner />;
  }
  return <UserManageContainer isPersonal />;
};
