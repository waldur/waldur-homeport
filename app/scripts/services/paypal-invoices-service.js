'use strict';

(function() {
  angular.module('ncsaas')
    .service('paypalInvoicesService', ['baseServiceClass', paypalInvoicesService]);

  function paypalInvoicesService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/paypal-invoices/';
      }
    });
    return new ServiceClass();
  }

})();
