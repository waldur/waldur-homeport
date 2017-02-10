'use strict';

(function() {
  angular.module('ncsaas')
    .service('paymentsService', ['baseServiceClass', 'ENV', '$http', paymentsService]);

  function paymentsService(baseServiceClass, ENV, $http) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/paypal-payments/';
      },
      approve: function(payment) {
        return $http.post(ENV.apiEndpoint + 'api/paypal-payments/approve/', payment);
      },
      cancel: function(payment) {
        return $http.post(ENV.apiEndpoint + 'api/paypal-payments/cancel/', payment);
      }
    });
    return new ServiceClass();
  }

})();
