'use strict';

(function() {
  angular.module('ncsaas')
    .service('paymentsService', ['baseServiceClass', paymentsService]);

  function paymentsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/payments/';
        this.filterByCustomer = false;
      }
    });
    return new ServiceClass();
  }

})();