'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseServiceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'customerPermissionsService',
      'currentStateService',
      'usersService',
      'joinService',
      'ENV',
      baseServiceListController]);

  // need for service tab
  function baseServiceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    customerPermissionsService,
    currentStateService,
    usersService,
    joinService,
    ENV
    ) {
    var ControllerListClass = baseControllerListClass.extend({
      customerHasProjects: true,
      init: function() {
        this.service = joinService;
        this._super();
        this.searchFieldName = 'name';
        this.checkPermissions();
        this.checkProjects();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),

            isDisabled: function(service) {
              return service.shared || !this.canUserManageService || service.resources_count > 0;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (service.shared) {
                return 'You cannot remove shared provider';
              }
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can remove provider';
              }
              if (service.resources_count > 0) {
               return 'Provider has resources. Please remove them first';
              }
            }.bind(this.controllerScope),
          }
        ];
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
          currentStateService.isQuotaExceeded('resource').then(function(response) {
            if (!response) {
              vm.actionButtonsListItems.push({
                title: 'Create resource',
                state: 'appstore.store'
              });
            }
          });
        }
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') == -1) {

          currentStateService.isQuotaExceeded('resource').then(function(response) {
            if (!response) {
              vm.actionButtonsListItems.push({
                title: 'Import resource',
                state: 'import.import',

                isDisabled: function(service) {
                  return service.shared || !vm.customerHasProjects;
                }.bind(vm.controllerScope),

                tooltip: function(service) {
                  if (service.shared) {
                    return 'You cannot import resources from shared provider';
                  }
                  if (!this.customerHasProjects) {
                    return 'Can not import resources until project is created';
                  }
                }.bind(vm.controllerScope),
              });
            }
          });
        }
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet.',
            createLink: 'services.create',
            createLinkText: 'Create provider',
            checkQuotas: 'service'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              className: 'name',
              showForMobile: true
            },
            {
              name: 'Type',
              propertyName: 'service_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Resources',
              propertyName: 'resources_count',
              emptyText: '0'
            }
          ]
        };
      },
      checkProjects: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customerHasProjects = (customer.projects.length > 0);
        });
      },
      removeInstance: function(model) {
        return this.service.$deleteByUrl(model.url);
      },
      checkPermissions: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          if (user.is_staff) {
            vm.canUserManageService = true;
            return;
          }
          customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
            vm.canUserManageService = hasRole;
          });
        });
      }
    });

    return ControllerListClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceAddController', [
      'servicesService',
      'joinServiceProjectLinkService',
      'joinService',
      'currentStateService',
      'baseControllerAddClass',
      'ENV',
      '$rootScope',
      '$state',
      ServiceAddController]);

  function ServiceAddController(
    servicesService,
    joinServiceProjectLinkService,
    joinService,
    currentStateService,
    baseControllerAddClass,
    ENV,
    $rootScope,
    $state) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      init: function() {
        this.service = joinService;
        this.controllerScope = controllerScope;
        this.successMessage = 'Provider has been created';
        this.categories = ENV.serviceCategories;
        this._super();
      },
      setModel: function(model) {
        this.model = angular.copy(model);
        this.model.serviceName = model.name;
        this.errors = {};
      },
      setCategory: function(category) {
        this.category = category;
        this.categoryServices = [];
        for (var i = 0; i < category.services.length; i++) {
          var name = category.services[i];
          var service = this.services[name];
          if (service) {
            this.categoryServices.push(service);
          }
        }
        this.setModel(this.categoryServices[0]);
      },
      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
        });
        servicesService.getServicesOptions().then(function(services) {
          vm.services = services;
          vm.setCategory(vm.categories[0]);
        });
      },

      beforeSave: function() {
        this.instance = this.service.$create(this.model.url);
        for (var i = 0; i < this.model.options.length; i++) {
          var option = this.model.options[i];
          if (option.value) {
            this.instance[option.key] = option.value;
          }
        }
        this.instance.customer = this.customer.url;
        this.instance.name = this.model.serviceName;
        this.instance.dummy = this.model.dummy;
      },

      afterSave: function() {
        joinServiceProjectLinkService.addService(this.instance).then(function() {
          $rootScope.$broadcast('refreshProjectList');
          $rootScope.$broadcast('customerBalance:refresh');
        });
      },

      successRedirect: function() {
        this.gotoOrganizationProviders();
      },

      cancel: function() {
        this.gotoOrganizationProviders();
      },

      gotoOrganizationProviders: function() {
        currentStateService.getCustomer().then(function(customer) {
          $state.go('organizations.details', {uuid: customer.uuid, tab: 'providers'});
        });
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

