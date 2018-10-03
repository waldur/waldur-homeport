// @ngInject
export default function paypalInvoicesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/paypal-invoices/';
    },
  });
  return new ServiceClass();
}
