import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { UserEvents } from './UserEvents';

export const UserEventsWrapper = () => {
  const user = useSelector(getUser);
  return <UserEvents user={user} />;
};
