import { useSelector } from 'react-redux';
import { User } from 'waldur-js-client';

import { getUser } from '@/workspace/selectors';

import { UserDelete } from './UserDelete';
import { UserStatus } from './UserStatus';

export const UserTermination = ({ user }: { user: User }) => {
  const currentUser = useSelector(getUser);
  return currentUser.is_staff ? (
    <>
      <UserDelete user={user} />
      <UserStatus user={user} />
    </>
  ) : null;
};
