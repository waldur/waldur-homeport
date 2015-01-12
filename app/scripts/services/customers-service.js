'use strict';

(function() {
  angular.module('ncsaas')
    .service('customersService', ['ENV', '$resource', customersService]);

  function customersService(ENV, $resource, $cookies) {
    /*jshint validthis: true */
    var vm = this;
    vm.customerResource = $resource(ENV.apiEndpoint + 'api/customers/:cutomerUUID', {cutomerUUID:'@uuid'});

  }

})();
