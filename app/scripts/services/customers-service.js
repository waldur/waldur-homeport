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
        var deferred = $q.defer(),
          error = true;
        agreementsService.getList({customer: customer.uuid}).then(function(response) {
          if (response) {
            for (var i = 0; i < response.length; i++) {
              if (response[i].customer == customer.url && response[i].state == 'active') {
                deferred.resolve(response[i]);
                error = false;
                break;
              }
            }
          }
          if (error) {
            deferred.reject();
          }
        });

        return deferred.promise;
      }
    });
    return new ServiceClass();
  }

})();
