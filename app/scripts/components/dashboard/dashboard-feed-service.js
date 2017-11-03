export default class DashboardFeedService {
  // @ngInject
  constructor(alertsService, eventsService, alertFormatter, eventFormatter) {
    this.alertsService = alertsService;
    this.eventsService = eventsService;
    this.alertFormatter = alertFormatter;
    this.eventFormatter = eventFormatter;
  }

  getProjectAlerts(project) {
    return this.alertsService.getList({
      aggregate: 'project',
      uuid: project.uuid
    }).then(alerts => {
      return alerts.map(alert => {
        alert.html_message = this.alertFormatter.format(alert);
        return alert;
      });
    });
  }

  getProjectEvents(project) {
    return this.eventsService.getList({
      scope: project.url
    }).then(events => {
      return events.map(event => {
        event.html_message = this.eventFormatter.format(event);
        event.created = event['@timestamp'];
        return event;
      });
    });
  }
}
