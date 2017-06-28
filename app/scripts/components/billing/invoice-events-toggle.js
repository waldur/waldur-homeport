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
        tenant_uuid: () => this.item.tenant_uuid,
      },
      size: 'lg',
    });
  }
}

const invoiceEventsToggle = {
  template,
  bindings: {
    item: '<'
  },
  controller: InvoiceEventsToggleController,
};

export default invoiceEventsToggle;
