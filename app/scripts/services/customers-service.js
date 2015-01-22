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
      return $resource(ENV.apiEndpoint + 'api/customers/:cutomerUUID/', {cutomerUUID:'@uuid'});
    }

})();
