import template from './billing-record-details.html';
import './billing-record-details.css';

const billingRecordDetails = {
  template,
  bindings: {
    invoice: '<'
  },
  controller: class BillingRecordDetailsController {
    // @ngInject
    constructor(BillingUtils) {
      this.BillingUtils = BillingUtils;
    }

    $onInit() {
      this.projects = this.BillingUtils.groupInvoiceItems(this.invoice);
    }
  }
};

export default billingRecordDetails;
