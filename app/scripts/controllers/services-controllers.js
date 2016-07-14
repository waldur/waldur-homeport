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
          backend_url: {
            required: true,
            label: 'API URL',
            value: 'http://keystone.example.com:5000/v2.0',
          },
          username: {
            value: 'admin',
            required: true,
          },
          password: {
            required: true,
          },
          tenant_name: {
            label: 'Admin tenant name',
            value: 'admin',
            requred: true,
          },
          external_network_id: {
            label: 'Public/gateway network UUID',
            help_text: 'ID of OpenStack external network that will be connected to tenants',
          },
          availability_zone: {
            placeholder: 'default',
          },
          coordinates: {
            label: 'Datacenter coordinates'
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
          'coordinates'
        ]
      },

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
        this.getOptions(model.name).then(function(options) {
          this.model.options = options;
        }.bind(this));
        this.errors = {};
      },

      fillPredefinedOptions: function(data) {
        angular.forEach(this.predefinedOptions, function(value, key) {
          data[key] = value;
        });
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
        return servicesService.getServicesList().then(function(services) {
          angular.forEach(services, function(service, name) {
            service.name = name;
          });
          vm.services = services;
          vm.setCategory(vm.categories[0]);
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
        this.fillPredefinedOptions(data);
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
