import template from './invoice-header.html';

const invoiceHeader = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class InvoiceHeaderController {
    // @ngInject
    constructor($window, currentStateService) {
      this.$window = $window;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.customerUUID = this.currentStateService.getCustomerUuid();
    }

    printLink() {
      this.$window.print();
    }
  }
};

export default invoiceHeader;
