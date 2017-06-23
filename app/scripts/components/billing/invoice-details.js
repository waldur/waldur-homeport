import template from './invoice-details.html';

const invoiceDetails = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class InvoiceDetailsController {
    // @ngInject
    constructor(BillingUtils) {
      this.BillingUtils = BillingUtils;
    }

    $onInit() {
      this.projects = this.BillingUtils.groupInvoiceItems(this.invoice);
    }
  }
};

export default invoiceDetails;
