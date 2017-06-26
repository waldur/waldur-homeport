import template from './billing-record-header.html';

const billingRecordHeader = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class BillingRecordHeaderController {
    // @ngInject
    constructor($window, $uibModal, currentStateService) {
      this.$window = $window;
      this.$uibModal = $uibModal;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.customerUUID = this.currentStateService.getCustomerUuid();
    }

    printLink() {
      this.$window.print();
    }

    openTimeline() {
      this.$uibModal.open({
        component: 'invoiceTimelineDialog',
        resolve: {
          invoice: () => this.invoice
        },
        size: 'lg'
      });
    }
  }
};

export default billingRecordHeader;
