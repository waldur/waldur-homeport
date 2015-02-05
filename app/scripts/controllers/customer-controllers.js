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

    function remove(customer) {
      var index = vm.list.indexOf(customer);

      customer.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

  angular.module('ncsaas')
    .controller('CustomerDetailUpdateController', [
      '$routeParams',
      '$rootScope',
      'customersService',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController($routeParams, $rootScope, customersService) {
    var vm = this;

    $rootScope.bodyClass = 'obj-view';

    vm.activeTab = 'resources';
    vm.customer = customersService.getCustomer($routeParams.uuid);
    vm.update = update;

    function update() {
      vm.customer.$update();
    }

  }

})();
