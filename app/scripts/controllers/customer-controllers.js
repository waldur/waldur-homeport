'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      'customersService',
      'baseControllerListClass',
      'usersService',
      CustomerListController
    ]);

  function CustomerListController(customersService, baseControllerListClass, usersService) {
    var controllerScope = this;
    var CustomerController = baseControllerListClass.extend({
      init:function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'name';
      },
      isOwner: function(customer) {
        for (var i = 0; i < customer.owners.length; i++) {
          if (usersService.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
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

(function() {
  angular.module('ncsaas')
    .controller('CustomerAddController', ['customersService', 'baseControllerAddClass', CustomerAddController]);

  function CustomerAddController(customersService, baseControllerAddClass) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        this._super();
        this.listState = 'customers.list';
        this.detailsState = 'customers.details';
        this.redirectToDetailsPage = true;
      },
      currentCustomerUpdatedHandler: function() {
        if (this.instance.name || this.instance.contact_details) {
          if (confirm('Clean all fields?')) {
            this.instance.name = '';
            this.instance.contact_details = '';
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
