'use strict';

(function() {
  angular.module('ncsaas')
    .service('paymentsService', ['baseServiceClass', 'ENV', '$http', paymentsService]);

  function paymentsService(baseServiceClass, ENV, $http) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/paypal-payments/';
        this.filterByCustomer = false;
      },
      approve: function(payment) {
        return $http.post(ENV.apiEndpoint + 'api/paypal-payments/approve/', payment);
      }
    });
    return new ServiceClass();
  }

})();
