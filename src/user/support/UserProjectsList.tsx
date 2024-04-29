import { FC, useMemo } from 'react';

import { BaseProjectsList } from '../affiliations/BaseProjectsList';

export const UserProjectsList: FC<{ user; hasActionBar? }> = ({
  user,
  hasActionBar = true,
}) => {
  const filter = useMemo(() => ({ user_uuid: user.uuid }), [user]);
  return <BaseProjectsList filter={filter} hasActionBar={hasActionBar} />;
};
