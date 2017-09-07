// @ngInject
export default function paypalInvoicesService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/paypal-invoices/';
    },
  });
  return new ServiceClass();
}
