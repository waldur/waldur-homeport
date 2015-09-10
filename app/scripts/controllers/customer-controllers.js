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
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('plans') == -1) {
          this.entityOptions.list.push({
            name: 'Plan',
            propertyName: 'plan_name',
            type: ENTITYLISTFIELDTYPES.noType,
            emptyText: 'No plan'
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
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('plans') == -1) {
          for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (item.plan) {
              item.plan_name = item.plan.name;
            }
          }
        }
      },
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

      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
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
      'joinServiceProjectLinkService',
      'servicesService',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController(
    $stateParams, baseServiceListController, joinService, joinServiceProjectLinkService, servicesService) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      options: {},
      lastModel: {},
      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer_uuid = $stateParams.uuid;
        var vm = this;
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'details',
            title: 'Settings',
            getFieldList: function(url) {
              return servicesService.getOption(url).then(function(response) {
                var fields = [];
                if (response.actions) {var put = response.actions.PUT;
                  vm.options = put;
                  for (var fieldName in put) {
                    if (!put[fieldName].read_only && fieldName != 'name') {
                      put[fieldName].name = fieldName;
                      fields.push(put[fieldName]);
                    }
                  }
                }
                return fields;
              });
            },
            getContent: function(url) {
              return servicesService.$get(null, url).then(function(provider) {
                return servicesService.$get(null, provider.settings);
              });
            }
          }
        ];
        this._super();
        this.entityOptions.list[0].type = 'editable';
        this.entityOptions.entityData.expandable = true;
      },
      afterGetList: function() {
        var vm = this;
        if ($stateParams.providerUuid && $stateParams.providerType) {
          servicesService.getServicesList().then(function(services) {
            var endpoint = services[$stateParams.providerType].url;
            servicesService.$get($stateParams.providerUuid, endpoint).then(function(provider) {
              if (provider.customer.indexOf($stateParams.uuid) + 1) {
                provider.expandItemOpen = true;
                vm.list = [provider].concat(vm.list);
                vm.currentProvider = provider;
              }
            });
          });
        }
      },
      update: function(model) {
        var vm = this;
        return joinServiceProjectLinkService.$update(null, model.url, model).then(
          function() {},
          function(errors) {
            var message = '';
            for (var name in errors.data) {
              message += (vm.options[name] ? vm.options[name].label : name) + ': ' + errors.data[name];
            }
            if (message) {
              vm.errorFlash(message);
            }
          });
      },
      showSave: function(model) {
        if (model) {
          if (!this.lastModel[model.uuid]) {
            this.lastModel[model.uuid] = model;
            return false;
          }
          if (this.lastModel[model.uuid] != model) {
            var fields = model.toJSON();
            for (var fieldName in fields) {
              var lastValue = this.lastModel[model.uuid][fieldName] ? this.lastModel[model.uuid][fieldName] : '';
              var nextValue = model[fieldName] ? model[fieldName] : '';
              if (lastValue != nextValue) {
                return true;
              }
            }
          }
        }
        return false;
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();


(function() {

  angular.module('ncsaas')
    .controller('CustomerProjectTabController', [
      'BaseProjectListController', '$stateParams', 'projectsService', CustomerProjectTabController]);

  function CustomerProjectTabController(BaseProjectListController, $stateParams, projectsService) {
    var controllerScope = this;
    var Controller = BaseProjectListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectsService;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.service.filterByCustomer = false;
        this._super();
        this.entityOptions.entityData.title = '';
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
        this.entityOptions.list.push({
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

