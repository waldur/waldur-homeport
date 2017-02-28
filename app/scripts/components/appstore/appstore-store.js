import template from './appstore-store.html';

export default function appstoreStore() {
  return {
    restrict: 'E',
    template: template,
    controller: AppStoreController,
    controllerAs: 'AppStore',
    scope: {},
  };
}

// @ngInject
function AppStoreController(
  baseControllerAddClass,
  servicesService,
  currentStateService,
  ENV,
  ncUtils,
  $q,
  $state,
  resourcesService,
  joinService,
  ncUtilsFlash,
  projectsService,
  priceEstimationService,
  ncServiceUtils,
  resourceUtils,
  AppstoreFieldConfiguration) {
  var controllerScope = this;
  var Controller = baseControllerAddClass.extend({
    enablePurchaseCostDisplay: ENV.enablePurchaseCostDisplay,

    secondStep: false,
    resourceTypesBlock: false,
    loadingResourceProperties: false,

    successMessage: 'Purchase of {vm_name} was successful.',
    formOptions: {},
    allFormOptions: {},
    selectedService: {},
    serviceType: null,
    selectedCategory: {},
    selectedResourceType: null,
    currentCustomer: {},
    currentProject: {},
    showCompare: ENV.showCompare,
    services: {},
    renderStore: false,
    loadingProviders: true,
    categoryServices: {},

    configureStepNumber: 4,
    chooseResourceTypeStepNumber: 3,

    fields: [],
    quotaThreshold: 0.8,

    init:function() {
      this.service = resourcesService;
      this.controllerScope = controllerScope;
      this._super();
    },
    activate:function() {
      var vm = this;
      servicesService.getServicesList().then(function(response) {
        vm.servicesMetadata = response;
        vm.setCurrentProject();
      });
      currentStateService.getCustomer().then(function(response) {
        vm.currentCustomer = response;
        if (ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'resource')) {
          $state.go('errorPage.limitQuota');
        }
      });
    },
    setCategory: function(category) {
      if (category === this.selectedCategory) {
        return;
      }

      if (category.requireOwnerOrStaff && !currentStateService.getOwnerOrStaff()) {
        $state.go('errorPage.notFound');
        return;
      }

      this.selectedCategory = category;
      this.secondStep = true;
      this.serviceMetadata = {};
      this.serviceType = null;
      this.resourceTypesBlock = false;
      this.selectedResourceType = null;
      this.selectedResourceTypeName = null;
      this.selectedService = null;
      this.fields = [];

      var services = this.categoryServices[this.selectedCategory.name];

      this.renderStore = services && services.length > 0;

      if (services && services.length == 1) {
        this.setService(services[0]);
      }
    },
    isVirtualMachinesSelected: function() {
      return this.selectedCategory.name == ENV.appStoreCategories[ENV.VirtualMachines].name;
    },
    isApplicationSelected: function() {
      return this.selectedCategory.name == ENV.appStoreCategories[ENV.Applications].name;
    },
    setService: function(service) {
      if (!service.enabled) {
        return;
      }
      this.selectedService = service;
      this.serviceType = this.selectedService.type;
      this.serviceMetadata = this.servicesMetadata[this.serviceType];
      this.fields = [];
      this.selectedResourceType = null;

      if (this.serviceMetadata) {
        var types = this.getResourceTypes(this.selectedCategory.key, this.serviceType);
        if (types.length === 1) {
          this.setResourceType(types[0]);
          this.resourceTypesBlock = false;
          this.configureStepNumber = 3;
        } else {
          this.resourceTypesBlock = true;
          this.configureStepNumber = 4;
        }
      }
    },
    getResourceTypes: function(category, serviceType) {
      var types = ENV.resourceCategory;
      var blacklisted = ['OpenStackTenant.Snapshot'];
      return Object.keys(types).filter(function(resource) {
        return types[resource] == category &&
               resource.split('.')[0] == serviceType &&
               blacklisted.indexOf(resource) === -1;
      }).map(function(resource) {
        return resource.split('.')[1];
      });
    },
    resetResourceType: function() {
      var vm = this;
      vm.selectedResourceType = null;
      vm.selectedResourceTypeName = null;
      vm.fields = [];
      vm.instance = null;
      vm.allFormOptions = null;
    },
    setResourceType: function(type) {
      var vm = this;
      vm.selectedResourceType = type;
      vm.errors = {};
      vm.selectedResourceTypeName = type.split(/(?=[A-Z])/).join(' ');
      vm.fields = [];

      var key = vm.serviceType + '.' + vm.selectedResourceType;
      var fields = angular.copy(AppstoreFieldConfiguration[key]);
      vm.fields = fields;

      var promise = servicesService.getOption(vm.getResourceUrl()).then(function(response) {
        var formOptions = angular.merge({}, response.actions.POST, fields.options);
        vm.allFormOptions = formOptions;
        return vm.getValidChoices(formOptions).then(function(validChoices) {
          vm.setFields(formOptions, validChoices);
        });
      });
      vm.loadingResourceProperties = true;
      promise.finally(function() {
        vm.instance = vm.buildInstance();
        vm.loadingResourceProperties = false;
      });
    },
    buildInstance: function() {
      return {
        type: this.selectedResourceType,
        customer: this.currentCustomer,
        project: this.currentProject,
        service: this.selectedService,
        service_project_link: this.selectedService.service_project_link_url
      };
    },
    getValidChoices: function(formOptions) {
      var vm = this;
      var promises = [];
      var validChoices = {};
      var context = {
        project: vm.currentProject.uuid,
        project_uuid: vm.currentProject.uuid,
        service_uuid: vm.selectedService.uuid,
        settings_uuid: vm.selectedService.settings_uuid,
        service_settings_uuid: vm.selectedService.settings_uuid,
      };

      angular.forEach(formOptions, function(options, name) {
        if (options.resource) {
          options.url = ENV.apiEndpoint + 'api/' + options.resource + '/';
        }

        if (options.url && name != 'service_project_link') {
          var parts = options.url.split('?');
          var base_url;
          var query;
          if (parts.length > 1) {
            base_url = parts[0];
            query = ncUtils.parseQueryString(parts[1]);
          } else {
            base_url = options.url;
            query = {};
          }
          query = angular.extend(query, context);

          var promise = servicesService.getAll(query, base_url).then(function(response) {
            validChoices[name] = response;
          });
          promises.push(promise);
        }
      });
      return $q.all(promises).then(function() {
        return validChoices;
      });
    },
    setFields: function(formOptions, validChoices) {
      var vm = this;
      angular.forEach(validChoices, function(choices, name) {
        if (vm.fields.options.hasOwnProperty(name)) {
          vm.fields.options[name].choices = choices;
        }
      });
    },
    getServiceTypeDisplay: ncServiceUtils.getTypeDisplay,
    getServiceIcon: ncServiceUtils.getServiceIcon,
    formatResourceType: resourceUtils.formatResourceType,
    setCurrentProject: function() {
      var vm = this;
      var categories = ENV.appStoreCategories;
      vm.categories = [];
      vm.selectedCategory = null;
      vm.secondStep = false;
      vm.serviceMetadata = {};
      vm.serviceType = null;
      vm.resourceTypesBlock = false;
      vm.fields = [];
      vm.selectedResourceType = null;
      vm.instance = null;
      vm.renderStore = false;
      vm.loadingProviders = true;

      vm.loadProjectWithServices().then(function() {
        for (var j = 0; j < categories.length; j++) {
          var category = categories[j];
          vm.categoryServices[category.name] = [];
          for (var i = 0; i < vm.currentProject.services.length; i++) {
            var service = vm.currentProject.services[i];
            service.warning = vm.getServiceDisabledReason(service) ||
                              vm.getServiceWarningMessage(service);
            service.enabled = !vm.getServiceDisabledReason(service);
            if (category.services && (category.services.indexOf(service.type) + 1)) {
              vm.categoryServices[category.name].push(service);
            }
          }
          if (vm.categoryServices[category.name].length > 0) {
            vm.categories.push(category);
          }
          vm.categoryServices[category.name].sort(function(a, b) {
            return a.enabled < b.enabled;
          });
        }
        vm.setCategoryFromParams();
      }).finally(function() {
        vm.loadingProviders = false;
      });
    },
    setCategoryFromParams: function() {
      var vm = this;
      var key = $state.$current.data.category;
      if (key) {
        for (var i = 0; i < vm.categories.length; i++) {
          var category = vm.categories[i];
          if (category.key === key) {
            vm.setCategory(category);
            return;
          }
        }
      }
    },
    loadProjectWithServices: function() {
      var vm = this;
      return currentStateService.getProject().then(function(project) {
        vm.currentProject = project;
        return joinService.getAll({
          project_uuid: project.uuid,
          field: ['url', 'quotas']
        }).then(function(services) {
          if (services.length === 0) {
            return;
          }
          angular.forEach(services, function(service) {
            var quotas = service.quotas.filter(function(quota) {
              return quota.limit !== -1 && quota.usage >= (quota.limit * vm.quotaThreshold);
            });
            service.reachedThreshold = quotas.length > 0;
            quotas = service.quotas.filter(function(quota) {
              return quota.limit !== -1 && quota.usage >= quota.limit;
            });
            service.reachedLimit = quotas.length === service.quotas.length && quotas.length > 0;
          });
          var details = services.reduce(function(result, service) {
            result[service.url] = service;
            return result;
          }, {});
          angular.forEach(vm.currentProject.services, function(service) {
            var detail = details[service.url];
            service.reachedThreshold = detail.reachedThreshold;
            service.reachedLimit = detail.reachedLimit;
          });
        });
      });
    },
    getServiceDisabledReason: function(service) {
      if (service.state === 'Erred') {
        return 'Provider is in erred state.';
      } else if (service.reachedLimit) {
        return 'All provider quotas have reached limit.';
      }
    },
    getServiceWarningMessage: function(service) {
      if (service.reachedThreshold) {
        return 'Provider quota have reached threshold.';
      }
    },
    canSave: function() {
      if (!this.instance) {
        return false;
      }
      for (var name in this.allFormOptions) {
        if (this.allFormOptions[name].required && (!this.instance[name] && this.instance[name] !== 0)) {
          return false;
        }
      }
      return true;
    },
    getTooltip: function() {
      if (!this.instance) {
        return 'Instance is not configured';
      }
      var fields = [];
      for (var name in this.allFormOptions) {
        var options = this.allFormOptions[name];
        if (options.required && !this.instance[name]) {
          fields.push(options.label);
        }
      }
      if (fields.length > 0) {
        return 'Please specify ' + fields.join(', ').toLowerCase();
      }
    },
    getResourceUrl: function() {
      if (this.selectedResourceType === 'Tenant') {
        return ENV.apiEndpoint + 'api/openstack-packages/';
      }
      return this.serviceMetadata.resources[this.selectedResourceType];
    },
    save: function() {
      if (!this.canSave()) {
        return $q.reject();
      }
      return this._super();
    },
    saveInstance: function() {
      var resourceUrl = this.getResourceUrl();
      var instance = servicesService.$create(resourceUrl);
      instance.service_project_link = this.selectedService.service_project_link_url;

      for (var name in this.allFormOptions) {
        if (this.instance.hasOwnProperty(name)) {
          var value = this.instance[name];
          var option = this.allFormOptions[name];
          if (value && value.hasOwnProperty('url')) {
            value = value.url;
          }
          if (option.serializer) {
            value = option.serializer(value, option);
          }
          instance[name] = value;
        }
      }
      return instance.$save();
    },
    afterSave: function() {
      this._super();
      projectsService.clearAllCacheForCurrentEndpoint();
      priceEstimationService.clearAllCacheForCurrentEndpoint();
    },
    onError: function() {
      var message = '';
      if (angular.isObject(this.errors)) {
        for (var name in this.errors) {
          if (this.allFormOptions[name]) {
            message += this.allFormOptions[name].label + ': ' + this.errors[name] + '<br/>';
          } else {
            message += name + ': ' + this.errors[name] + '<br/>';
          }
        }
      } else {
        message = 'Server error occurred';
      }
      ncUtilsFlash.error(message);
    },
    successRedirect: function(model) {
      if (this.selectedResourceType === 'Tenant') {
        $state.go('resources.details', {
          uuid: ncUtils.getUUID(model.tenant),
          resource_type: 'OpenStack.Tenant'
        });
      } else {
        $state.go('resources.details', {uuid: model.uuid, resource_type: model.resource_type});
      }
    }
  });

  controllerScope.__proto__ = new Controller();
}
