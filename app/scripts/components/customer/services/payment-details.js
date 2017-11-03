// @ngInject
export default function paymentDetailsService(baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/payment-details/';
    }
  });
  return new ServiceClass();
}
