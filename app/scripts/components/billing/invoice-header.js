import template from './invoice-header.html';

const invoiceHeader = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class InvoiceHeaderController {
    // @ngInject
    constructor($window, $uibModal, currentStateService, features) {
      this.$window = $window;
      this.$uibModal = $uibModal;
      this.currentStateService = currentStateService;
      this.features = features;
    }

    $onInit() {
      this.paypalVisible = this.features.isVisible('paypal');
      this.customerUUID = this.currentStateService.getCustomerUuid();
    }

    printLink() {
      this.$window.print();
    }

    canDownloadInvoice() {
      return this.paypalVisible && this.invoice.pdf;
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

export default invoiceHeader;
