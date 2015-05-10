'use strict';

(function() {
  angular.module('ncsaas')
    .service('ordersService', ['baseServiceClass', ordersService]);

  function ordersService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/orders/';
        this.executeOrder = this.operation.bind(this, 'execute');
      }
    });
    return new ServiceClass();
  }

})();
