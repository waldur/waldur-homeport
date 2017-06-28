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
      scope: this.getTenantUrl(tenant_uuid),
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
      original: event,
    }));
  }

  getEventColor(event) {
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
  }

  getEventIcon(event) {
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
  }
}
