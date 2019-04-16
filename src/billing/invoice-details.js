import template from './invoice-details.html';
import { getItemName } from './utils';

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
      this.projects = this.BillingUtils.groupInvoiceItems(this.invoice.items);
    }

    getItemName(item) {
      return getItemName(item);
    }
  }
};

export default invoiceDetails;
