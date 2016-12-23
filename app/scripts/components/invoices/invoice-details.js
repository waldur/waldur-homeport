import template from './invoice-details.html';

export default function invoiceDetails() {
  return {
    restrict: 'E',
    controller: InvoiceDetailsController,
    controllerAs: 'InvoiceDetails',
    template: template,
    scope: {},
    bindToController: true
  };
}

// @ngInject
class InvoiceDetailsController {
  constructor(invoicesService, $state, $window, currentStateService) {
    this.invoicesService = invoicesService;
    this.currentStateService = currentStateService;
    this.$state = $state;
    this.$window = $window;
    this.init();
  }

  init() {
    this.invoice = {};
    this.loading = true;
    this.invoicesService.$get(this.$state.params.invoiceUUID).then(invoice => {
      this.invoice = invoice;
      this.loading = false;
    });
    this.customerUUID = this.currentStateService.getCustomerUuid();
  }

  printLink() {
    this.$window.print();
  }
}
