import { useSelector } from 'react-redux';

import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';
import { getCustomer } from '@waldur/workspace/selectors';

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
