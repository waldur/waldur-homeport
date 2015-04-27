'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      '$rootScope',
      '$location',
      'customersService',
      CustomerListController
    ]);

  function CustomerListController($rootScope, $location, customersService) {
    var vm = this;

    vm.list = customersService.getCustomersList();
    vm.remove = remove;
    vm.service = customersService;

    function remove(customer) {
      var index = vm.list.indexOf(customer);

      customer.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

  angular.module('ncsaas')
    .controller('CustomerDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      'customersService',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController($stateParams, $rootScope, customersService) {
    var vm = this;

    vm.activeTab = 'resources';
    vm.customer = customersService.getCustomer($stateParams.uuid);
    vm.update = update;

    function update() {
      vm.customer.$update();
    }

  }

})();
