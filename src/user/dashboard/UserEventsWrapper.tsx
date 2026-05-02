import { useUser } from '@/workspace/hooks';

import { UserEvents } from './UserEvents';

export const UserEventsWrapper = () => {
  const user = useUser();
  return <UserEvents user={user} />;
};
