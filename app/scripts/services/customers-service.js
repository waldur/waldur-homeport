'use strict';

(function() {
  angular.module('ncsaas')
    .service('customersService', ['RawCustomer', customersService]);

  function customersService(RawCustomer) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomersList = getCustomersList;

    function getCustomersList() {
      return RawCustomer.query();
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

      return $resource(ENV.apiEndpoint + 'api/customers/:cutomerUUID/', {cutomerUUID:'@uuid'},
        {
          getFirst: {
              method: 'GET',
              transformResponse: getFirst
          }
        }
      );
    }

})();
