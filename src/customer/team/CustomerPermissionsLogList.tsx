import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerPermissionsLogList = () => {
  const customer = useSelector(getCustomer);
  const eventsFilter = useMemo(
    () => ({
      scope: customer.url,
      event_type: ['role_granted', 'role_revoked', 'role_updated'],
    }),
    [customer],
  );

  return (
    <BaseEventsList
      table={`permissions-log-${customer.url}`}
      filter={eventsFilter}
    />
  );
};
