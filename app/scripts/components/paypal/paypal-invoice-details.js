import template from '../billing/invoice-details.html';

const paypalInvoiceDetails = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class PayPalInvoiceDetailsController {
    // @ngInject
    constructor(BillingUtils) {
      this.BillingUtils = BillingUtils;
    }

    $onInit() {
      this.projects = this.BillingUtils.groupInvoiceItems(this.invoice.items);
    }
  }
};

export default paypalInvoiceDetails;
