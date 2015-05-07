'use strict';

(function() {
  angular.module('ncsaas')
    .service('planCustomersService', ['baseServiceClass', planCustomersService]);

  function planCustomersService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/plan-customers/';
        this.filterByCustomer = false;
      }
    });
    return new ServiceClass();
  }

})();
