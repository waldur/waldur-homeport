export default class InvoiceEventsService {
  // @ngInject
  constructor(ENV, eventsService, eventFormatter) {
    this.ENV = ENV;
    this.eventsService = eventsService;
    this.eventFormatter = eventFormatter;
  }

  loadEvents(tenant_uuid) {
    return this.loadTenantEvents(tenant_uuid).then(this.parseEvents.bind(this));
  }

  loadTenantEvents(tenant_uuid) {
    return this.eventsService.getAll({
      scope: this.getTenantUrl(),
      event_type: [
        'openstack_package_created',
        'openstack_package_deleted',
      ],
    });
  }

  getTenantUrl(tenant_uuid) {
    return `${this.ENV.apiEndpoint}api/openstack-tenants/${tenant_uuid}/`;
  }

  parseEvents(events) {
    return events.map(event => ({
      date: event['@timestamp'],
      message: this.eventFormatter.format(event),
      color: this.getEventColor(event),
      icon: this.getEventIcon(event),
    }));
  }

  getEventColor(event) {
    const classes = {
      openstack_package_created: 'navy-bg',
      openstack_package_deleted: 'yellow-bg',
    };
    return classes[event.event_type] || 'lazur-bg';
  }

  getEventIcon(event) {
    const classes = {
      openstack_package_created: 'fa-plus-circle',
      openstack_package_deleted: 'fa-trash-o',
    };
    return classes[event.event_type];
  }
}
