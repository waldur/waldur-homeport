import template from './invoice-details.html';

const invoiceDetails = {
  template,
  bindings: {
    invoice: '<'
  },
  controllerAs: 'InvoiceDetails',
  controller: class InvoiceDetailsController {
    constructor($window, currentStateService) {
      // @ngInject
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

export default invoiceDetails;
