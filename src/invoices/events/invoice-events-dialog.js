import template from './invoice-events-dialog.html';

const invoiceEventsDialog = {
  template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<',
  },
  controller: class InvoiceEventsDialogController {
    // @ngInject
    constructor(InvoiceEventsService, $uibModal) {
      this.InvoiceEventsService = InvoiceEventsService;
      this.$uibModal = $uibModal;
    }

    $onInit() {
      this.loading = true;
      this.erred = false;
      this.InvoiceEventsService.loadEvents(this.resolve.item)
        .then(events => (this.events = events))
        .catch(() => (this.erred = true))
        .finally(() => (this.loading = false));
    }

    showEventDetails(event) {
      this.close();
      this.$uibModal.open({
        component: 'eventDetailsDialog',
        resolve: {
          event: () => event.original,
        },
      });
    }
  },
};

export default invoiceEventsDialog;
