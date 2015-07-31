'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      'customersService',
      'baseControllerListClass',
      'usersService',
      'ENTITYLISTFIELDTYPES',
      CustomerListController
    ]);

  function CustomerListController(customersService, baseControllerListClass, usersService, ENTITYLISTFIELDTYPES) {
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
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no organizations yet.',
            title: 'Organizations',
            createLink: 'organizations.create',
            createLinkText: 'Add organization'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'organizations.details({uuid: entity.uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            }
          ]
        };
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
      '$stateParams',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(
    baseControllerDetailUpdateClass,
    customersService,
    customerImageService,
    usersService,
    Flash,
    ENV,
    $stateParams
    ) {
    var controllerScope = this;
    var CustomerController = baseControllerDetailUpdateClass.extend({
      activeTab: 'resources',
      customer: null,
      files: [],
      canEdit: false,

      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'organizations.details';
        this.currentUser = usersService.currentUser;
        this.detailsViewOptions = {
          title: 'Organization',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          hasLogo: true,
          listState: 'organizations.list',
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name'
            },
            {
              fieldKey: 'contact_details',
              isEditable: true
            }
          ],
          tabs: [
            {
              title: 'Resources',
              key: 'resources',
              viewName: 'tabResources'
            },
            {
              title: 'Projects',
              key: 'projects',
              viewName: 'tabProjects'
            },
            {
              title: 'Services',
              key: 'services',
              viewName: 'tabServices'
            }
          ]
        };
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
        controllerScope.canEdit = controllerScope.isOwnerOrStaff(controllerScope.model);
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
          Flash.create('warning', 'Unable to upload image');
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
          Flash.create('warning', 'Unable to delete image');
        });
      },

      afterUpdate: function() {
        this.successFlash('Customer {} is updated'.replace('{}', controllerScope.model.name));
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
      'cloudsService',
      'ENTITYLISTFIELDTYPES',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController($stateParams, baseServiceListController, cloudsService, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      init: function() {
        this.service = cloudsService;
        this.controllerScope = controllerScope;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.service.filterByCustomer = false;
        this._super();
        this.deregisterEvent('currentCustomerUpdated');

        this.entityOptions = {
          entityData: {
            noDataText: 'You have no services yet.'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'services.details({uuid: entity.uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Type',
              propertyName: 'provider',
              type: ENTITYLISTFIELDTYPES.noType
            }
          ]
        };
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();


(function() {

  angular.module('ncsaas')
    .controller('CustomerProjectTabController', [
      '$stateParams',
      'baseControllerListClass',
      'projectsService',
      'ENTITYLISTFIELDTYPES',
      CustomerProjectTabController
    ]);

  function CustomerProjectTabController($stateParams, baseControllerListClass, projectsService, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.service.filterByCustomer = false;
        this._super();
        this.deregisterEvent('currentCustomerUpdated');
        this.actionButtonsListItems = [
          {
            title: 'Archive',
            clickFunction: function(project) {}
          },
          {
            title: 'Delete',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no projects yet.'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'projects.details({uuid: entity.uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Creation date',
              propertyName: 'created',
              type: ENTITYLISTFIELDTYPES.dateCreated
            }
          ]
        };
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('CustomersResourceTabController', [
      '$stateParams',
      'baseResourceListController',
      'resourcesService',
      CustomersResourceTabController
    ]);

  function CustomersResourceTabController(
    $stateParams,
    baseResourceListController,
    resourcesService
  ) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this._super();
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

