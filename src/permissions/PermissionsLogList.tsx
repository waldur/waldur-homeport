import { getEventsList } from '@waldur/events/BaseEventsList';

export const PermissionsLogList = getEventsList({
  mapPropsToFilter: (props) => ({
    scope: props.scope.url,
    event_type: ['role_granted', 'role_revoked', 'role_updated'],
  }),
  mapPropsToTableId: (props) => ['permissions-log', props.scope.url],
});
