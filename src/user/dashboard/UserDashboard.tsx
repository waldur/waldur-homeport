import { FC } from 'react';

import { useUser } from '@waldur/workspace/hooks';

import { UserAffiliationsList } from '../affiliations/UserAffiliationsList';

export const UserDashboard: FC = () => {
  const user = useUser();

  return !user || <UserAffiliationsList user={user} />;
};
