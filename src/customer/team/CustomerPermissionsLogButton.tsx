import { useSelector } from 'react-redux';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { getCustomer } from '@/workspace/selectors';

export const CustomerPermissionsLogButton = () => {
  const customer = useSelector(getCustomer);
  return (
    <FilteredEventsButton
      filter={{
        scope: customer.url,
        event_type: ['role_granted', 'role_revoked', 'role_updated'],
      }}
      asDropdownItem
    />
  );
};
