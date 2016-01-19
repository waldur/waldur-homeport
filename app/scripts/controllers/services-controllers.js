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
      '$rootScope',
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
    $rootScope,
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
            title: 'Delete',
            clickFunction: this.remove.bind(this.controllerScope),

            isDisabled: function(service) {
              return service.shared || !this.canUserManageService || service.resources_count > 0;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (service.shared) {
                return 'You cannot delete shared provider';
              }
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can delete provider';
              }
              if (service.resources_count > 0) {
               return 'Provider has resources. Please delete them first';
              }
            }.bind(this.controllerScope),
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet.',
            noMatchesText: 'No providers found matching filter.',
            createLink: 'services.create',
            createLinkText: 'Create provider',
            checkQuotas: 'service',
            timer: ENV.providersTimerInterval
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              className: 'name'
            },
            {
              name: 'State',
              type: ENTITYLISTFIELDTYPES.colorState,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus,
              className: 'visual-status',
              getClass: function(state) {
                var cls = ENV.servicesStateColorClasses[state];
                if (cls == 'processing') {
                  return 'icon refresh spin';
                } else {
                  return 'status-circle ' + cls;
                }
              }
            },
            {
              name: 'My provider',
              propertyName: 'shared',
              type: ENTITYLISTFIELDTYPES.bool,
              className: 'shared-filed',
              logic: 'NOT'
            },
            {
              name: 'Type',
              propertyName: 'service_type',
              type: ENTITYLISTFIELDTYPES.noType,
              className: 'service-type',
            },
            {
              name: 'Resources',
              propertyName: 'resources_count',
              emptyText: '0',
              className: 'resources-count'
            }
          ],
          mobile: {
            getIconClass: function(entity) {
              return 'fa-database';
            },
            getTitle: function(entity) {
              return entity.name;
            },
            getSubtitleText: function(entity) {
              var accessibility = entity.shared ? 'Shared ' : 'Owned ';
              var count = ' provider without resources';
              if (entity.resources_count == 1) {
                count = ' provider with 1 resource';
              } else if (entity.resources_count > 1) {
                count = ' provider with ' + entity.resources_count + ' resources';
              }
              return accessibility + entity.service_type + count;
            },
            getSideText: function(entity) {
              return entity.state;
            }
          }
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
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList');
        this._super(instance);
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
          if (!value) {
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

