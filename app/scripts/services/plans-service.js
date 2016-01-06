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
      },
      getFreePlan: function() {
        return this.getList().then(function(plans) {
          for (var i = 0; i < plans.length; i++) {
            if (plans[i].price == '0.00') {
              return plans[i];
            }
          };
        })
      }
    });
    return new ServiceClass();
  }

})();