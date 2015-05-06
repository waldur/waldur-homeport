'use strict';

(function() {
  angular.module('ncsaas')
    .service('plansService', ['baseServiceClass', plansService]);

  function plansService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/plans/';
        this.filterByCustomer = false;
      }
    });
    return new ServiceClass();
  }

})();