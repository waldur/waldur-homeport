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
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: 'In Sync',
              className: 'visual-status',
              showForMobile: true,
            },
            {
              name: 'Type',
              propertyName: 'service_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Resources',
              propertyName: 'resources_count',
              emptyText: '0',
              className: 'resources-count'
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
      '$q',
      'ncUtils',
      ServiceAddController]);

  function ServiceAddController(
    servicesService,
    joinServiceProjectLinkService,
    joinService,
    currentStateService,
    baseControllerAddClass,
    ENV,
    $rootScope,
    $state,
    $q,
    ncUtils) {
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
        var promise = $q.all([this.getCustomer(), this.getServices()]);
        ncUtils.blockElement('create-service', promise);
      },

      getCustomer: function() {
        var vm = this;
        return currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
        });
      },

      getServices: function() {
        var vm = this;
        return servicesService.getServicesOptions().then(function(services) {
          vm.services = services;
          vm.setCategory(vm.categories[0]);
        });
      },

      saveInstance: function() {
        var data = this.getData();
        var vm = this;
        return this.service.create(this.model.url, data).then(function(response) {
          vm.instance = response;
          joinServiceProjectLinkService.addService(vm.instance).then(function() {
            $rootScope.$broadcast('refreshProjectList');
            $rootScope.$broadcast('customerBalance:refresh');
          });
        });
      },
      getFilename: ncUtils.getFilename,
      getData: function() {
        var data = {};
        for (var i = 0; i < this.model.options.length; i++) {
          var option = this.model.options[i];
          var value = option.value;
          if (angular.isUndefined(value)) {
            continue;
          }
          if (ncUtils.isFileOption(option)) {
            if (value.length != 1 || !ncUtils.isFileValue(value[0])) {
              continue;
            }
            value = value[0];
          }
          data[option.key] = value;
        }
        data.customer = this.customer.url;
        data.name = this.model.serviceName;
        data.dummy = !!this.model.dummy;
        return data;
      },

      successRedirect: function() {
        $state.go('organizations.details', {
          uuid: this.customer.uuid,
          tab: 'providers',
          providerType: this.instance.service_type,
          providerUuid: this.instance.uuid
        });
      },

      cancel: function() {
        $state.go('organizations.details', {
          uuid: this.customer.uuid,
          tab: 'providers'
        });
      },

      isDisabled: function() {
        if (!this.model || !this.model.options) {
          return true;
        }
        for (var i = 0; i < this.model.options.length; i++) {
          var option = this.model.options[i];
          if (angular.isUndefined(option.value) && option.required) {
            return true;
          }
        }
        return false;
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

