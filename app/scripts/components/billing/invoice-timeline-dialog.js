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
    constructor(eventsService, eventFormatter) {
      this.eventsService = eventsService;
      this.eventFormatter = eventFormatter;
    }

    $onInit() {
      this.loading = true;
      const start = moment({
        year: this.resolve.invoice.year,
        month: this.resolve.invoice.month - 1,
        day: 1,
      });
      const end = start.clone().endOf('month');
      this.eventsService.getAll({
        event_type: [
          'openstack_package_created',
          'openstack_package_deleted',
        ],
        scope: this.resolve.invoice.customer,
        start: start.unix(),
        end: end.unix(),
      })
      .then(events => {
        this.events = events.map(event => {
          return {
            date: event['@timestamp'],
            message: this.eventFormatter.format(event)
          };
        });
      })
      .finally(() => this.loading = false);
    }
  }
};

export default invoiceTimelineDialog;
