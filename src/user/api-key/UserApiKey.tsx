import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useUser } from '@/workspace/hooks';

import { AuthenticationEvents } from './AuthenticationEvents';
import { UserTokenLifetime } from './UserTokenLifetime';

export const UserApiKey: FunctionComponent = () => {
  const user = useUser();
  if (!user) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <UserTokenLifetime user={user} />
      <AuthenticationEvents user={user} />
    </>
  );
};
