'use strict';

(function() {
  angular.module('ncsaas')
    .service('paymentDetailsService', ['baseServiceClass', paymentDetailsService]);

  function paymentDetailsService(baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/payment-details/';
      }
    });
    return new ServiceClass();
  }

})();
