import { FC } from 'react';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';

interface ResourcePermissionsLogButtonProps {
  scopeUrl: string;
}

/**
 * History entry for the Team toolbar's Actions kebab. Mirrors
 * `CustomerPermissionsLogButton` from the org side — same dialog,
 * same role.* event filter — but takes the scope URL as a prop so it
 * works for both Resource and ResourceProject scopes.
 */
export const ResourcePermissionsLogButton: FC<
  ResourcePermissionsLogButtonProps
> = ({ scopeUrl }) => (
  <FilteredEventsButton
    filter={{
      scope: scopeUrl,
      event_type: [
        'role_granted',
        'role_revoked',
        'role_updated',
        // Resource-project lifecycle: who created/removed/recovered a
        // sub-project, scoped to the resource via the event feed.
        'marketplace_resource_project_created',
        'marketplace_resource_project_removed',
        'marketplace_resource_project_recovered',
      ],
    }}
    asDropdownItem
  />
);
