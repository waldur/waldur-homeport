import { getAll } from '@waldur/core/api';
import eventsRegistry from '@waldur/events/registry';

const getEventColor = (event) => {
  const classes = {
    openstack_package_created: 'bg-success',
    openstack_package_deleted: 'bg-success',
    resource_creation_scheduled: 'bg-info',
    resource_creation_succeeded: 'bg-success',
    resource_creation_failed: 'bg-danger',
    resource_deletion_scheduled: 'bg-info',
    resource_deletion_succeeded: 'bg-success',
    resource_deletion_failed: 'bg-danger',
  };
  return classes[event.event_type] || 'lazur-bg';
};

const getEventIcon = (event) => {
  const classes = {
    openstack_package_created: 'fa-plus-circle',
    openstack_package_deleted: 'fa-trash-o',
    resource_creation_scheduled: 'fa-plus-circle',
    resource_creation_succeeded: 'fa-plus-circle',
    resource_creation_failed: 'fa-plus-circle',
    resource_deletion_scheduled: 'fa-trash-o',
    resource_deletion_succeeded: 'fa-trash-o',
    resource_deletion_failed: 'fa-trash-o',
  };
  return classes[event.event_type];
};

const parseEvents = (events) => {
  return events.map((event) => ({
    date: event.created,
    message: eventsRegistry.formatEvent(event),
    color: getEventColor(event),
    icon: getEventIcon(event),
    original: event,
  }));
};

export const loadEvents = async (item) => {
  // TODO: Remove extra check after https://opennode.atlassian.net/browse/WAL-1211
  if (item.scope_type && item.scope_uuid) {
    const events = await getAll('/events/', {
      params: {
        resource_type: item.scope_type,
        resource_uuid: item.scope_uuid,
      },
    });
    return parseEvents(events);
  } else {
    return [];
  }
};
