import template from './invoice-events-dialog.html';

const invoiceEventsDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class InvoiceEventsDialogController {
    // @ngInject
    constructor(InvoiceEventsService, EventDialogsService) {
      this.InvoiceEventsService = InvoiceEventsService;
      this.EventDialogsService = EventDialogsService;
    }

    $onInit() {
      this.loading = true;
      this.erred = false;
      this.InvoiceEventsService.loadEvents(this.resolve.item)
        .then(events => this.events = events)
        .catch(() => this.erred = true)
        .finally(() => this.loading = false);
    }

    showEventDetails(event) {
      this.close();
      this.EventDialogsService.eventDetails(event.original);
    }
  }
};

export default invoiceEventsDialog;
