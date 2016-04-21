'use strict';

(function() {
  angular.module('ncsaas')
    .service('customersService', [
      'baseServiceClass', '$state', '$q', 'ENV', 'currentStateService', 'usersService', customersService]);

  function customersService(baseServiceClass, $state, $q, ENV, currentStateService, usersService) {
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
              $state.go('initialdata.view');
              deferred.reject();
            }
          }
        );

        return deferred.promise;
      },
      getBalanceHistory: function(uuid) {
        var query = {UUID: uuid, operation: 'balance_history'};
        return this.getList(query);
      },
      getCounters: function(query) {
        var query = angular.extend({operation: 'counters'}, query);
        return this.getFactory(false).get(query).$promise;
      },
      getTopMenuList: function () {
        var deferred = $q.defer();

        this.pageSize = ENV.topMenuCustomersCount;
        this.cacheTime = ENV.topMenuCustomersCacheTime;
        this.getList().then(function(response) {
          deferred.resolve(response);
        });
        // reset pageSize
        this.pageSize = ENV.pageSize;

        return deferred.promise;
      },
      isOwnerOrStaff: function() {
        if (usersService.currentUser.is_staff) {
          return $q.when(true);
        }
        return currentStateService.getCustomer().then(function(customer) {
          for (var i = 0; i < customer.owners.length; i++) {
            if (usersService.currentUser.uuid === customer.owners[i].uuid) {
              return $q.when(true);
            }
          }
          return $q.when(false);
        });
      }
    });
    return new ServiceClass();
  }

})();
