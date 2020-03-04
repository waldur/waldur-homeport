import template from './invoice-events-toggle.html';

class InvoiceEventsToggleController {
  // @ngInject
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  showEvents() {
    return this.$uibModal.open({
      component: 'invoiceEventsDialog',
      resolve: {
        item: () => this.item,
      },
      size: 'lg',
    });
  }
}

const invoiceEventsToggle = {
  template,
  bindings: {
    item: '<',
  },
  controller: InvoiceEventsToggleController,
};

export default invoiceEventsToggle;
