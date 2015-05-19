'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      'customersService',
      'baseControllerListClass',
      CustomerListController
    ]);

  function CustomerListController(customersService, baseControllerListClass) {
    var controllerScope = this;
    var CustomerController = baseControllerListClass.extend({
      init:function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'name';
      }
    });

    controllerScope.__proto__ = new CustomerController();

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
