import { User } from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

import { UserDelete } from './UserDelete';
import { UserStatus } from './UserStatus';

export const UserTermination = ({ user }: { user: User }) => {
  const currentUser = useUser();
  return currentUser.is_staff ? (
    <>
      <UserDelete user={user} />
      <UserStatus user={user} />
    </>
  ) : null;
};
