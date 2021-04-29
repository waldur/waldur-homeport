import { ENV } from '@waldur/configs/default';
import { getEvents } from '@waldur/events/api';
import eventsRegistry from '@waldur/events/registry';
import { Event } from '@waldur/events/types';

import { InvoiceEvent } from './types';

const getEventColor = (event) => {
  const classes = {
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
    resource_creation_scheduled: 'fa-plus-circle',
    resource_creation_succeeded: 'fa-plus-circle',
    resource_creation_failed: 'fa-plus-circle',
    resource_deletion_scheduled: 'fa-trash-o',
    resource_deletion_succeeded: 'fa-trash-o',
    resource_deletion_failed: 'fa-trash-o',
  };
  return classes[event.event_type];
};

const parseEvents = (events: Event[]): InvoiceEvent[] => {
  return events.map((event) => ({
    date: event.created,
    message: eventsRegistry.formatEvent(event),
    color: getEventColor(event),
    icon: getEventIcon(event),
    original: event,
  }));
};

export const loadEvents = async (resource: string) => {
  if (resource) {
    const events = await getEvents({
      scope: `${ENV.apiEndpoint}api/marketplace-resources/${resource}/`,
    });
    return parseEvents(events);
  } else {
    return [];
  }
};
