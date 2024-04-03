import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { TableComponent } from '@waldur/events/BaseEventsList';
import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

export const customerPermissionsLogList = () => {
  const customer = useSelector(getCustomer);
  const eventsFilter = useMemo(
    () => ({
      scope: customer.url,
      event_type: ['role_granted', 'role_revoked', 'role_updated'],
    }),
    [customer],
  );

  const eventsTable = useTable({
    table: `permissions-log${customer.url}`,
    filter: eventsFilter,
    fetchData: createFetcher('events'),
    queryField: 'message',
  });

  return <TableComponent {...eventsTable} />;
};
