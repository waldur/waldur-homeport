export default class InvoiceEventsService {
  // @ngInject
  constructor($q, ENV, eventsService, eventFormatter) {
    this.$q = $q;
    this.ENV = ENV;
    this.eventsService = eventsService;
    this.eventFormatter = eventFormatter;
  }

  loadEvents(item) {
    let resource_type, resource_uuid;
    if (item.tenant_uuid) {
      resource_type = 'OpenStack.Tenant';
      resource_uuid = item.tenant_uuid;
    }
    else if (item.scope_type) {
      resource_type = item.scope_type;
      resource_uuid = item.scope_uuid;
    } else {
      return this.$q.resolve([]);
    }
    return this.eventsService.getAll({
      resource_type,
      resource_uuid
    }).then(this.parseEvents.bind(this));
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
