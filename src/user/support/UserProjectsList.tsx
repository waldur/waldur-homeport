import { useMemo } from 'react';

import { BaseProjectsList } from '../affiliations/BaseProjectsList';

export const UserProjectsList = ({ user }) => {
  const filter = useMemo(() => ({ user_uuid: user.uuid }), [user]);
  return <BaseProjectsList filter={filter} />;
};
