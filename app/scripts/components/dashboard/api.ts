import { alertFormatter, alertsService } from '@waldur/alerts/services';
import { eventFormatter, eventsService } from '@waldur/events/services';

import { FeedItem, Project } from './types';

function fetchAlerts(project: Project): Promise<FeedItem[]> {
  return alertsService.getList({
    aggregate: 'project',
    uuid: project.uuid
  }).then(alerts => {
    return alerts.map(alert => {
      alert.html_message = alertFormatter.format(alert);
      return alert;
    });
  });
}

function fetchEvents(project: Project): Promise<FeedItem[]> {
  return eventsService.getList({
    scope: project.url
  }).then(events => {
    return events.map(event => {
      event.html_message = eventFormatter.format(event);
      event.created = event['@timestamp'];
      return event;
    });
  });
}

export {
  fetchAlerts,
  fetchEvents,
};
