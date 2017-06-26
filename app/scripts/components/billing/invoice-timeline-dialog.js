import template from './invoice-timeline-dialog.html';

const invoiceTimelineDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class InvoiceTimelineDialogController {
    // @ngInject
    constructor($q, eventsService, eventFormatter) {
      this.$q = $q;
      this.eventsService = eventsService;
      this.eventFormatter = eventFormatter;
    }

    $onInit() {
      this.loading = true;
      this.loadEvents().finally(() => this.loading = false);
    }

    loadEvents() {
      // Load events for all resources in invoice
      const resources = this.getRelatedResources();
      return this.loadResourcesEvents(resources).then(events => this.parseEvents(events));
    }

    parseEvents(events) {
      // Extract date and formatted message from plain event
      return events.map(event => {
        return {
          date: event['@timestamp'],
          message: this.eventFormatter.format(event)
        };
      });
    }

    loadResourcesEvents(resources) {
      // TODO: On backend allow scope parameter to receive list of URLs
      const promises = resources.map(this.loadResourceEvents.bind(this));
      return this.$q.all(promises).then(this.flatten.bind(this));
    }

    loadResourceEvents(resource) {
      return this.eventsService.getAll({
        scope: resource,
        event_type: [
          'openstack_package_created',
          'openstack_package_deleted',
        ],
      });
    }

    getRelatedResources() {
      // Collect list of unique URLs for all resources in the invoice
      const items = this.resolve.invoice.openstack_items;
      return this.getUnique(items.map(item => item.package));
    }

    getUnique(items) {
      // Exclude duplicates from list
      let result = [];
      items.forEach(item => {
        if (result.indexOf(item) < 0) {
          result.push(item);
        }
      });
      return result;
    }

    flatten(lists) {
      // Convert nested list to plain list
      let result = [];
      lists.forEach(list => result = result.concat(list));
      return result;
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
};

export default invoiceTimelineDialog;
