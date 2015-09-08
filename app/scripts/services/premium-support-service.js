'use strict';

(function() {
  angular.module('ncsaas')
    .service('premiumSupportPlansService', ['baseServiceClass', premiumSupportPlansService]);

  function premiumSupportPlansService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/premium-support-plans/';
        this.filterByCustomer = false;
      }
    });
    return new ServiceClass();
  }

})();


(function() {
  angular.module('ncsaas')
    .service('premiumSupportContractsService', ['baseServiceClass', premiumSupportContractsService]);

  function premiumSupportContractsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/premium-support-contracts/';
        this.filterByCustomer = false;
      }
    });
    return new ServiceClass();
  }

})();