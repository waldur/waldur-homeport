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
        this.currentUser = usersService.currentUser;
        this.actionButtonsListItems = [
          {
            title: 'Remove'
          },
          {
            title: 'Add service',
            state: 'services.create'
          }
        ];
        if (this.currentUserIsStaff()) {
          this.actionButtonsListItems[0].clickFunction = this.remove.bind(controllerScope);
        } else {
          this.actionButtonsListItems[0].state = 'support.create';
        }
      },
      isOwnerOrStaff: function(customer) {
        if (this.currentUserIsStaff()) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },
      currentUserIsStaff: function() {
        return this.currentUser.is_staff;
      }
    });

    controllerScope.__proto__ = new CustomerController();

  }

  angular.module('ncsaas')
    .controller('CustomerDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'customersService',
      'customerImageService',
      'usersService',
      'Flash',
      'ENV',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(baseControllerDetailUpdateClass,
    customersService, customerImageService, usersService, Flash, ENV) {
    var controllerScope = this;
    var CustomerController = baseControllerDetailUpdateClass.extend({
      activeTab: 'resources',
      customer: null,
      files: [],

      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'organizations.details';
        this.currentUser = usersService.currentUser;
      },

      isOwnerOrStaff: function(customer) {
        if (this.currentUser.is_staff) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },

      afterActivate: function() {
        controllerScope.updateImageUrl();
      },

      updateImageUrl: function() {
        controllerScope.imageUrl = controllerScope.model.image || ENV.defaultCustomerIcon;
      },

      uploadImage: function() {
        customerImageService.create({
          uuid: controllerScope.model.uuid,
          file: controllerScope.files[0]
        }).then(function (response) {
          controllerScope.files = [];
          controllerScope.model.image = response.data.image;
          controllerScope.updateImageUrl();
          Flash.create('success', 'Customer image is uploaded');
        }, function (response) {
          Flash.create('warning', response.data.image);
        });
      },

      deleteImage: function() {
        controllerScope.model.image = null;
        customerImageService.delete({
          uuid: controllerScope.model.uuid
        }).then(function (response) {
          Flash.create('success', 'Customer image is deleted');
          controllerScope.model.image = null;
          controllerScope.updateImageUrl();
        }, function (response) {
          Flash.create('warning', response.data.errors);
        });
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
        this.listState = 'organizations.list';
        this.detailsState = 'organizations.details';
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

(function() {
  angular.module('ncsaas')
    .controller('CustomerServiceTabController', [
      '$stateParams',
      'baseServiceListController',
      'servicesService',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController($stateParams, baseServiceListController, servicesService) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      init: function() {
        this.service = servicesService;
        this.controllerScope = controllerScope;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.service.filterByCustomer = false;
        this._super();
        this.deregisterEvent('currentCustomerUpdated');
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();
