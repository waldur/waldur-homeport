import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectPermissionsLogList = () => {
  const project = useSelector(getProject);
  const eventsFilter = useMemo(
    () => ({
      scope: project.url,
      event_type: ['role_granted', 'role_revoked', 'role_updated'],
    }),
    [project],
  );

  return (
    <BaseEventsList
      table={`permissions-log-${project.url}`}
      filter={eventsFilter}
    />
  );
};
