import { FC, useMemo } from 'react';

import { BaseEventsList } from '@waldur/events/BaseEventsList';

export const UserEvents: FC<{ user?; hasActionBar? }> = ({
  user,
  hasActionBar = true,
}) => {
  const filter = useMemo(
    () => ({
      scope: user.url,
      feature: 'users',
      exclude_extra: true,
    }),
    [user],
  );
  return (
    <BaseEventsList
      filter={filter}
      table={`user-events-${user.uuid}`}
      hasActionBar={hasActionBar}
    />
  );
};
