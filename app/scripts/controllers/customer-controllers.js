'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      'customersService',
      'baseControllerListClass',
      'usersService',
      'ENTITYLISTFIELDTYPES',
      '$rootScope',
      '$state',
      'ENV',
      CustomerListController
    ]);

  function CustomerListController(
    customersService, baseControllerListClass, usersService, ENTITYLISTFIELDTYPES, $rootScope, $state, ENV) {
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
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope),

            isDisabled: function(customer) {
              return !this.isOwnerOrStaff(customer) || customer.projects.length != 0;
            }.bind(controllerScope),

            tooltip: function(customer) {
              if (!this.isOwnerOrStaff(customer)) {
                return 'Only owner or staff can remove organization';
              }
              if (customer.projects.length != 0) {
               return 'Organization has projects. Please remove them first';
              }
            }.bind(controllerScope),
          },
          {
            title: 'Add provider',
            clickFunction: function(customer) {
              $rootScope.$broadcast('adjustCurrentCustomer', customer);
              $state.go('services.create')
            }
          }
        ];
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
        if (ENV.toBeFeatures.indexOf('plans') == -1 || ENV.featuresVisible) {
          this.entityOptions.list.push({
            name: 'Plan',
            propertyName: 'planName',
            type: ENTITYLISTFIELDTYPES.noType
          });
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
      },
      afterInstanceRemove: function(intance) {
        $rootScope.$broadcast('refreshCustomerList', {model: intance, remove: true});
        this._super(intance);
      },
      afterGetList: function() {
        var vm = this;
        for (var i = 0; i < vm.list.length; i++) {
          if (!vm.list[i].planName && (ENV.toBeFeatures.indexOf('plans') == -1 || ENV.featuresVisible)) {
            vm.list[i].planName = vm.list[i].plan ? vm.list[i].plan.name : 'No plan';
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
      'customerImageService',
      'usersService',
      'Flash',
      'ENV',
      '$stateParams',
      '$rootScope',
      '$q',
      'resourcesCountService',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(
    baseControllerDetailUpdateClass,
    customersService,
    customerImageService,
    usersService,
    Flash,
    ENV,
    $stateParams,
    $rootScope,
    $q,
    resourcesCountService
    ) {
    var controllerScope = this;
    var CustomerController = baseControllerDetailUpdateClass.extend({
      activeTab: 'resources',
      files: [],
      canEdit: false,
      currentPlan: null,

      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
        this._super();
        this.detailsState = 'organizations.details';
        this.currentUser = usersService.currentUser;
        this.chartData = {
          labels: ["Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Events",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [65, 59, 80, 81, 56, 55, 40]
            }
          ]
        };
        this.chartOptions = {
          responsive: true,
          scaleShowGridLines : false
        };
        this.detailsViewOptions = {
          title: 'Organization',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          hasLogo: true,
          listState: 'organizations.list',
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name',
              emptyText: 'Add name'
            },
            {
              fieldKey: 'contact_details',
              isEditable: true,
              className: 'details',
              emptyText: 'Add contact details'
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
              title: 'Providers',
              key: 'providers',
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
        $rootScope.$broadcast('adjustCurrentCustomer', this.model);

        var vm = this;
        customersService.getCurrentPlan(vm.model).then(function(response) {
          vm.currentPlan = response.plan_name;
        });

        controllerScope.canEdit = controllerScope.isOwnerOrStaff(controllerScope.model);
        controllerScope.updateImageUrl();

        this.setCounters();
      },

      setCounters: function() {
        var vm = this;
        $q.all([
          resourcesCountService.resources({'customer_uuid': vm.model.uuid}),
          resourcesCountService.projects({'customer': vm.model.uuid}),
          resourcesCountService.services({'customer_uuid': vm.model.uuid})
        ]).then(function(responses) {
          vm.detailsViewOptions.tabs[0].count = responses[0];
          vm.detailsViewOptions.tabs[1].count = responses[1];
          vm.detailsViewOptions.tabs[2].count = responses[2];
        });
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
          Flash.create('success', 'Organization image is uploaded');
        }, function (response) {
          Flash.create('warning', 'Unable to upload image');
        });
      },

      deleteImage: function() {
        controllerScope.model.image = null;
        customerImageService.delete({
          uuid: controllerScope.model.uuid
        }).then(function (response) {
          Flash.create('success', 'Organization image is deleted');
          controllerScope.model.image = null;
          controllerScope.updateImageUrl();
        }, function (response) {
          Flash.create('warning', 'Unable to delete image');
        });
      },
      update: function(data, fieldName) {
        var d = $q.defer();
        if (data || fieldName != 'name') {
          return this._super();
        }
        d.resolve('This field is required.');
        return d.promise;
      },
      afterUpdate: function() {
        this.successFlash('Organization {} is updated'.replace('{}', controllerScope.model.name));
        $rootScope.$broadcast('refreshCustomerList', {model: this.model, update: true});
      }
    });

    controllerScope.__proto__ = new CustomerController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerAddController',
    ['customersService', 'baseControllerAddClass', '$rootScope', CustomerAddController]);

  function CustomerAddController(customersService, baseControllerAddClass, $rootScope) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'organizations.list';
        this.detailsState = 'organizations.details';
        this.redirectToDetailsPage = true;
      },
      afterSave: function() {
        $rootScope.$broadcast('refreshCustomerList', {model: this.instance, new: true, current: true});
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
      'joinService',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController($stateParams, baseServiceListController, joinService) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer_uuid = $stateParams.uuid;
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'details',
            list:['name']
          }
        ];
        this._super();
        this.entityOptions.entityData.expandable = true;
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
      '$rootScope',
      CustomerProjectTabController
    ]);

  function CustomerProjectTabController(
    $stateParams, baseControllerListClass, projectsService, ENTITYLISTFIELDTYPES, $rootScope) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.service = projectsService;
        this.controllerScope = controllerScope;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.service.filterByCustomer = false;
        this._super();
        this.service.filterByCustomer = true;
        this.actionButtonsListItems = [
          {
            title: 'Delete',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no projects yet.',
            createLink: 'projects.create',
            createLinkText: 'Add project'
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
      },
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList', {model: instance, remove: true});
        this._super(instance);
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
      'ENTITYLISTFIELDTYPES',
      CustomersResourceTabController
    ]);

  function CustomersResourceTabController(
    $stateParams,
    baseResourceListController,
    resourcesService,
    ENTITYLISTFIELDTYPES
  ) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        // resource endpoint is using a different customer filter name
        this.service.filterByCustomer = false;
        this.service.defaultFilter.customer_uuid = $stateParams.uuid;
        this._super();
                this.entityOptions.list.push(
            {
              name: 'Project',
              propertyName: 'project_name',
              link: 'projects.details({uuid: entity.project_uuid})',
              type: ENTITYLISTFIELDTYPES.name
            });

      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

