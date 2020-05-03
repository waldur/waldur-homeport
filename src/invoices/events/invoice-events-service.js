import eventsRegistry from '@waldur/events/registry';

export default class InvoiceEventsService {
  // @ngInject
  constructor($q, ENV, eventsService) {
    this.$q = $q;
    this.ENV = ENV;
    this.eventsService = eventsService;
  }

  loadEvents(item) {
    // TODO: Remove extra check after https://opennode.atlassian.net/browse/WAL-1211
    if (item.scope_type && item.scope_uuid) {
      return this.eventsService
        .getAll({
          resource_type: item.scope_type,
          resource_uuid: item.scope_uuid,
        })
        .then(this.parseEvents.bind(this));
    } else {
      return this.$q.resolve([]);
    }
  }

  parseEvents(events) {
    return events.map(event => ({
      date: event.created,
      message: eventsRegistry.formatEvent(event),
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
