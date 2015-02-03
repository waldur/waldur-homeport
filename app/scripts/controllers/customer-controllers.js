'use strict';

(function() {
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
