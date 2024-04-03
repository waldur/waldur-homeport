import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { TableComponent } from '@waldur/events/BaseEventsList';
import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
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

  const eventsTable = useTable({
    table: `permissions-log${project.url}`,
    filter: eventsFilter,
    fetchData: createFetcher('events'),
    queryField: 'message',
  });

  return <TableComponent {...eventsTable} />;
};
