import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { useCustomer } from '@/workspace/hooks';

export const CustomerPermissionsLogButton = () => {
  const customer = useCustomer();
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
