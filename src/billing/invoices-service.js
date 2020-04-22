// @ngInject
export default function invoicesService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/invoices/';
    },
  });
  return new ServiceClass();
}
