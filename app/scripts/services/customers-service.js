'use strict';

(function() {
  angular.module('ncsaas')
    .service('customersService', ['baseServiceClass', '$q', 'agreementsService', customersService]);

  function customersService(baseServiceClass, $q, agreementsService) {
    var ServiceClass = baseServiceClass.extend({
      filterByCustomer: false,

      init:function() {
        this._super();
        this.endpoint = '/customers/';
      },
      getPersonalOrFirstCustomer: function(username) {
        var deferred = $q.defer();
        /*jshint camelcase: false */
        this.getList().then(
          function(customers) {
            for(var i = 0; i < customers.length; i++) {
              if (customers[i].name === username) {
                deferred.resolve(customers[i]);
              }
            }
            if (customers.length !== 0) {
              deferred.resolve(customers[0]);
            } else {
              deferred.resolve(undefined);
            }
          }
        );

        return deferred.promise;
      },
      getCurrentPlan: function(customer) {
        var deferred = $q.defer();
        agreementsService.getList({customer: customer.uuid, state: 'active'}).then(function(response) {
          if (response.length > 0) {
            deferred.resolve(response[0]);
          } else {
            deferred.reject();
          }
        });

        return deferred.promise;
      },
      getBalanceHistory: function(uuid) {
        var query = {UUID: uuid, operation: 'balance_history'};
        return this.getList(query);
      }
    });
    return new ServiceClass();
  }

})();
