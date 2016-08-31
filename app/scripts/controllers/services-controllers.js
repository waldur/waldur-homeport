'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseServiceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'currentStateService',
      'customersService',
      'joinService',
      '$rootScope',
      'ENV',
      'ncServiceUtils',
      baseServiceListController]);

  // need for service tab
  function baseServiceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    currentStateService,
    customersService,
    joinService,
    $rootScope,
    ENV,
    ncServiceUtils
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
            icon: 'fa-trash',
            destructive: true,
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
          },
          {
            title: 'Unlink',
            icon: 'fa-trash',
            destructive: true,

            clickFunction: function(service) {
              var vm = this.controllerScope;
              var confirmDelete = confirm('Are you sure you want to unlink provider and all related resources?');
              if (confirmDelete) {
                vm.unlinkService(service).then(function() {
                  vm.afterInstanceRemove(service);
                }, vm.handleActionException.bind(vm));
              }
            }.bind(this.controllerScope),

            isDisabled: function(service) {
              return !this.canUserManageService;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can unlink provider.';
              }
            }.bind(this.controllerScope),
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet.',
            noMatchesText: 'No providers found matching filter.',
            createLink: null,
            createLinkText: 'Add provider',
            checkQuotas: 'service',
            timer: ENV.providersTimerInterval,
            rowTemplateUrl: 'views/service/row.html'
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
              getClass: ncServiceUtils.getStateClass
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
          ]
        };
        this.checkPermissions();
      },
      checkProjects: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
          vm.customerHasProjects = (customer.projects.length > 0);
        });
      },
      removeInstance: function(model) {
        return this.service.$deleteByUrl(model.url);
      },
      unlinkService: function(service) {
        return this.service.operation('unlink', service.url);
      },
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList');
        this._super(instance);
      },
      checkPermissions: function() {
        var vm = this;
        customersService.isOwnerOrStaff().then(function(isOwnerOrStaff) {
          if (isOwnerOrStaff) {
            vm.entityOptions.entityData.createLink = 'services.create';
          }
          vm.canUserManageService = isOwnerOrStaff;
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
      'joinService',
      'currentStateService',
      'baseControllerAddClass',
      'ENV',
      '$rootScope',
      '$state',
      '$scope',
      '$q',
      'ncUtils',
      ServiceAddController]);

  function ServiceAddController(
    servicesService,
    joinService,
    currentStateService,
    baseControllerAddClass,
    ENV,
    $rootScope,
    $state,
    $scope,
    $q,
    ncUtils) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      predefinedOptions: {
        available_for_all: true
      },

      blacklistedOptions: ['name', 'images_regex'],
      secretFields: ['token', 'password'],
      optionTypes: ['string', 'choice', 'boolean', 'url', 'file upload'],

      extraOptions: {
        OpenStack: {
          is_admin: {
            type: 'boolean'
          },
          tenant_name: {
            help_text: ''
          },
          backend_url: {
            help_text: ''
          },
          username: {
            help_text: ''
          }
        },
        DigitalOcean: {
          token: {
            required: true
          }
        }
      },

      optionsOrder: {
        OpenStack: [
          'backend_url',
          'username',
          'password',
          'tenant_name',
          'external_network_id',
          'availability_zone',
          'latitude',
          'longitude',
        ]
      },

      errors: {},

      init: function() {
        this.service = joinService;
        this.controllerScope = controllerScope;
        this.successMessage = 'Provider has been created';
        var vm = this;
        $scope.$watch('ServiceAdd.serviceChoice', function(choice) {
          if (!choice) {
            return;
          }
          var service = vm.services[choice.name];
          if (service) {
            vm.setModel(service);
          }
        });
        this._super();
      },
      setModel: function(model) {
        this.model = angular.copy(model);
        this.model.serviceName = model.name;
        this.loadingService = true;
        this.getOptions(model.name).then(function(options) {
          this.model.options = options;
          angular.forEach(options, function(option) {
            if (option.default_value) {
              option.value = option.default_value;
            }
          });
        }.bind(this)).finally(function() {
          this.loadingService = false;
        }.bind(this));
        controllerScope.errors = {};
      },

      fillPredefinedOptions: function(data) {
        angular.forEach(this.predefinedOptions, function(value, key) {
          data[key] = value;
        });
      },

      activate: function() {
        this.loadingCustomer = true;
        $q.all([this.getCustomer(), this.getServices()]).finally(function() {
          this.loadingCustomer = false;
        }.bind(this));
      },

      getCustomer: function() {
        var vm = this;
        return currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
        });
      },

      getServices: function() {
        var vm = this;
        return servicesService.getServicesList().then(function(services) {
          vm.choices = [];
          angular.forEach(services, function(service, name) {
            service.name = name;
            var category = ENV.serviceCategories.filter(function(category) {
              return category.services.indexOf(name) !== -1;
            })[0];
            if (category) {
              vm.choices.push({
                name: name,
                category: category.name
              });
            }
          });
          vm.serviceChoice = vm.choices[0];
          vm.services = services;
        });
      },

      getOptions: function(service_type) {
        return joinService.getOptions(service_type).then(function(options) {
          var items = [];
          angular.forEach(options, function(option, key) {
            if (this.isValidOption(option, key)) {
              option.key = key;
              option.secret = this.secretFields.indexOf(key) !== -1;
              var extra = this.extraOptions[service_type];
              if (extra) {
                option = angular.extend(option, extra[key]);
              }
              items.push(option);
            }
          }.bind(this));
          return this.orderOptions(service_type, items);
        }.bind(this));
      },

      orderOptions: function(service_type, options) {
        var ordering = this.optionsOrder[service_type];
        if (!ordering) {
          return options;
        }
        return options.sort(function(x, y) {
          return ordering.indexOf(x.key) - ordering.indexOf(y.key);
        });
      },

      isValidOption: function(option, key) {
        // Skip non supported option types
        return (
          this.optionTypes.indexOf(option.type) !== -1 &&
          this.blacklistedOptions.indexOf(key) === -1 &&
          !this.predefinedOptions[key]
        );
      },

      saveInstance: function() {
        var data = this.getData();
        var vm = this;
        return this.service.create(this.model.url, data).then(function(response) {
          vm.instance = response;
          $rootScope.$broadcast('refreshProjectList');
          $rootScope.$broadcast('customerBalance:refresh');
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
        this.fillPredefinedOptions(data);
        return data;
      },

      successRedirect: function() {
        $state.go('organizations.details.providers', {
          uuid: this.customer.uuid,
          providerType: this.instance.service_type,
          providerUuid: this.instance.uuid
        });
      },

      cancel: function() {
        $state.go('organizations.details.providers', {
          uuid: this.customer.uuid
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
