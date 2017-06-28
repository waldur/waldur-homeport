import template from './billing-record-header.html';

const billingRecordHeader = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class BillingRecordHeaderController {
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

export default billingRecordHeader;
