import { FC, useMemo } from 'react';

import { BaseEventsList } from '@/events/BaseEventsList';
import { useFilterValues } from '@/table/useFilterValues';

import { UserEventsFilter, UserEventsFilterFormId } from './UserEventsFilter';

export const UserEvents: FC<{ user?; hasActionBar? }> = ({
  user,
  hasActionBar = true,
}) => {
  const tableId = `user-events-${user.uuid}`;
  const values = useFilterValues(tableId);
  const includeRelated = Boolean(values?.include_related);

  const filter = useMemo(() => {
    if (includeRelated) {
      return {
        related_user_uuid: user.uuid,
      };
    }
    return {
      scope: user.url,
      feature: 'users',
      exclude_extra: true,
    };
  }, [includeRelated, user.url, user.uuid]);

  return (
    <BaseEventsList
      filter={filter}
      table={tableId}
      formId={UserEventsFilterFormId}
      filters={<UserEventsFilter />}
      hasActionBar={hasActionBar}
    />
  );
};
