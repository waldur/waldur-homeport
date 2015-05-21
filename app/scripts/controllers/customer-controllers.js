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
      'baseControllerDetailUpdateClass',
      'customersService',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(baseControllerDetailUpdateClass, customersService) {
    var controllerScope = this;
    var CustomerController = baseControllerDetailUpdateClass.extend({
      activeTab: 'resources',
      customer: null,

      init:function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'customers.details';
      }
    });

    controllerScope.__proto__ = new CustomerController();
  }

})();
