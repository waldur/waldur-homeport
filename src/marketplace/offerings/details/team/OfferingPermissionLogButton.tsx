import { FC } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';

/**
 * History entry for the Team toolbar's Actions kebab. Same role.* event feed
 * the org and resource Team pages use, scoped to the offering.
 */
export const OfferingPermissionLogButton: FC<{ offering: Offering }> = ({
  offering,
}) => (
  <FilteredEventsButton
    filter={{
      scope: offering.url,
      event_type: ['role_granted', 'role_revoked', 'role_updated'],
    }}
    asDropdownItem
  />
);
