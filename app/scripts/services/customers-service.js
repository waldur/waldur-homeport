'use strict';

(function() {
  angular.module('ncsaas')
    .service('customersService', ['RawCustomer', customersService]);

  function customersService(RawCustomer) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomersList = getCustomersList;
    vm.createCustomer = createCustomer;
    vm.getCustomer = getCustomer;

    function getCustomersList() {
      return RawCustomer.query();
    }

    function createCustomer() {
      return new RawCustomer();
    }

    function getCustomer(uuid) {
      return RawCustomer.get({customerUUID: uuid});
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
