// @ngInject
export default function paymentDetailsService(baseServiceClass) {
  var ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/payment-details/';
    }
  });
  return new ServiceClass();
}
