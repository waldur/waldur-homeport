'use strict';

(function() {
  // XXX: This services has inherit BaseService and always return promises
  angular.module('ncsaas')
    .service('customersService', ['$q', 'RawCustomer', customersService]);

  function customersService($q, RawCustomer) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomersList = getCustomersList;
    vm.createCustomer = createCustomer;
    vm.getCustomer = getCustomer;
    vm.getFirst = getFirst;
    vm.getPersonalOrFirstCustomer = getPersonalOrFirstCustomer;

    function getFirst() {
      return RawCustomer.getFirst().$promise;
    }

    function getCustomersList() {
      return RawCustomer.query();
    }

    function createCustomer() {
      return new RawCustomer();
    }

    function getCustomer(uuid) {
      return RawCustomer.get({customerUUID: uuid});
    }

    function getPersonalOrFirstCustomer(username) {
      var deferred = $q.defer();
      /*jshint camelcase: false */
      RawCustomer.query().$promise.then(
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
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .factory('RawCustomer', ['ENV', '$resource', RawCustomer]);

    function RawCustomer(ENV, $resource) {

      function getFirst(data) {
        var customers = angular.fromJson(data);
        if (customers.length > 0) {
          return customers[0];
        } else {
          return undefined;
        }
      }

      return $resource(ENV.apiEndpoint + 'api/customers/:customerUUID/', {customerUUID:'@uuid'},
        {
          getFirst: {
              method: 'GET',
              transformResponse: getFirst
          },
          update: {
            method: 'PUT'
          }
        }
      );
    }

})();
