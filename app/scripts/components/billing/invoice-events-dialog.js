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
    constructor(InvoiceEventsService) {
      this.InvoiceEventsService = InvoiceEventsService;
    }

    $onInit() {
      this.loading = true;
      this.erred = false;
      this.InvoiceEventsService.loadEvents(this.resolve.tenant_uuid)
        .then(events => this.events = events)
        .catch(() => this.erred = true)
        .finally(() => this.loading = false);
    }
  }
};

export default invoiceEventsDialog;
