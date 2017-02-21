import template from './billing-record-details.html';

const billingRecordDetails = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class BillingRecordDetailsController {
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

export default billingRecordDetails;
