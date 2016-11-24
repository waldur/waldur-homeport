(function() {
  angular.module('ncsaas')
    .service('AppStoreUtilsService', AppStoreUtilsService);

  AppStoreUtilsService.$inject = ['$uibModal', 'ENV'];
  function AppStoreUtilsService($uibModal, ENV) {
    this.openDialog = openDialog;
    this.findOffering = findOffering;

    function openDialog(options) {
      $uibModal.open({
        component: 'appstoreCategorySelector',
        size: 'lg',
        resolve: {
          selectProject: function() {
            return options && options.selectProject;
          }
        }
      });
    }
    function findOffering(key) {
      var offerings = ENV.offerings;
      for (var i = 0; i < offerings.length; i++) {
        if (offerings[i].key === key) {
          return offerings[i];
        }
      }
    }
  }

  angular.module('ncsaas')
    .controller('AppStoreHeaderController', AppStoreHeaderController);

  AppStoreHeaderController.$inject = ['$scope', '$stateParams', 'AppStoreUtilsService']
  function AppStoreHeaderController($scope, $stateParams, AppStoreUtilsService) {
    $scope.openDialog = AppStoreUtilsService.openDialog;
    refreshCategory();
    $scope.$on('$stateChangeSuccess', refreshCategory);
    function refreshCategory() {
      if ($stateParams.category) {
        $scope.category = AppStoreUtilsService.findOffering($stateParams.category);
      }
    }
  }


  angular.module('ncsaas')
    .controller('AppStoreController', [
      'baseControllerAddClass',
      'servicesService',
      'currentStateService',
      'ENV',
      'defaultPriceListItemsService',
      'ncUtils',
      '$q',
      '$state',
      '$stateParams',
      '$rootScope',
      'premiumSupportPlansService',
      'premiumSupportContractsService',
      'resourcesService',
      'resourcesCountService',
      'joinService',
      'ncUtilsFlash',
      'projectsService',
      'priceEstimationService',
      '$scope',
      '$filter',
      'ncServiceUtils',
      'resourceUtils',
      'AppstoreFieldConfiguration',
      AppStoreController]);

  function AppStoreController(
    baseControllerAddClass,
    servicesService,
    currentStateService,
    ENV,
    defaultPriceListItemsService,
    ncUtils,
    $q,
    $state,
    $stateParams,
    $rootScope,
    premiumSupportPlansService,
    premiumSupportContractsService,
    resourcesService,
    resourcesCountService,
    joinService,
    ncUtilsFlash,
    projectsService,
    priceEstimationService,
    $scope,
    $filter,
    ncServiceUtils,
    resourceUtils,
    AppstoreFieldConfiguration) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      enablePurchaseCostDisplay: ENV.enablePurchaseCostDisplay,
      VmProviderSettingsUuid: ENV.VmProviderSettingsUuid,
      gitLabProviderSettingsUuid: ENV.gitLabProviderSettingsUuid,

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
      providers: [],
      services: {},
      renderStore: false,
      loadingProviders: true,
      categoryServices: {},

      configureStepNumber: 4,
      selectedPackageName: null,
      agreementShow: false,
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
        });
      },
      setCategory: function(category) {
        if (category === this.selectedCategory) {
          return;
        }

        if (category.requireStaffOwnerManager && !currentStateService.getStaffOwnerManager()) {
          $state.go('errorPage.notFound');
          return;
        }

        this.selectedCategory = category;
        this.secondStep = true;
        this.serviceMetadata = {};
        this.serviceType = null;
        this.selectedPackage = {};
        this.agreementShow = false;
        this.resourceTypesBlock = false;
        this.selectedResourceType = null;
        this.selectedResourceTypeName = null;
        this.selectedService = null;
        this.fields = [];

        var services = this.categoryServices[this.selectedCategory.name];

        this.renderStore = (services && services.length > 0) ||
                           (category.packages && category.packages.length > 0);

        if (ENV.VmProviderSettingsUuid && this.isVirtualMachinesSelected()) {
          for (var i = 0; i < services.length; i++) {
            if (services[i].settings_uuid == ENV.VmProviderSettingsUuid) {
              this.setService(services[i]);
              this.configureStepNumber = 2;
              this.secondStep = false;
              break;
            }
          }
        } else if (ENV.gitLabProviderSettingsUuid && this.isApplicationSelected()) {
          for (var i = 0; i < services.length; i++) {
            if (services[i].settings_uuid == ENV.gitLabProviderSettingsUuid) {
              this.setService(services[i]);
              this.chooseResourceTypeStepNumber = 2;
              this.configureStepNumber = 3;
              this.secondStep = false;
              break;
            }
          }
        } else if (services && services.length == 1) {
          this.setService(services[0]);
        }
      },
      isVirtualMachinesSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.VirtualMachines].name;
      },
      isApplicationSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.Applications].name;
      },
      isSupportSelected: function() {
        return this.selectedCategory.name == 'Support';
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
          var types = Object.keys(this.serviceMetadata.resources);
          var filteredTypes = types.filter(this.filterResources.bind(this));
          if (filteredTypes.length === 1) {
            this.setResourceType(filteredTypes[0]);
            this.resourceTypesBlock = false;
            this.configureStepNumber = 3;
          } else {
            this.resourceTypesBlock = true;
            this.configureStepNumber = 4;
          }
        }
      },
      filterResources: function(item) {
        if (this.selectedCategory.name === 'Virtual machines') {
          if (this.serviceType === 'OpenStackTenant' && item != 'Instance') {
            return false;
          }
        } else if (this.selectedCategory.name === 'Private clouds') {
          return item === 'Tenant';
        } else if (this.selectedCategory.name === 'Storages') {
          return item === 'Volume';
        }
        return true;
      },
      setResourceType: function(type) {
        var vm = this;
        vm.selectedResourceType = type;
        vm.errors = {};
        vm.selectedResourceTypeName = type.split(/(?=[A-Z])/).join(" ");
        vm.fields = [];
        vm.instance = vm.buildInstance();

        var promise = servicesService.getOption(vm.getResourceUrl()).then(function(response) {
          var formOptions = response.actions.POST;
          vm.allFormOptions = formOptions;
          return vm.getValidChoices(formOptions).then(function(validChoices) {
            vm.setFields(formOptions, validChoices);
          });
        });
        vm.loadingResourceProperties = true;
        promise.finally(function() {
          vm.loadingResourceProperties = false;
        });
      },
      buildInstance: function() {
        return {
          type: this.selectedResourceType,
          customer: this.currentCustomer,
          project: this.currentProject,
          service: this.selectedService,
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
          if (options.url && name != 'service_project_link') {
            var parts = options.url.split("?");
            if (parts.length > 1) {
              var base_url = parts[0];
              var query = ncUtils.parseQueryString(parts[1])
            } else {
              var base_url = options.url;
              var query = {};
            }
            var query = angular.extend(query, context);

            var promise = servicesService.getAll(query, base_url).then(function(response) {
              validChoices[name] = response.map(function(item) {return {item: item}});
            });
            promises.push(promise);
          }
        });
        return $q.all(promises).then(function() {
          return validChoices;
        });
      },
      setFields: function(formOptions, validChoices) {
        var key = this.serviceType + '.' + this.selectedResourceType;
        var fields = angular.copy(AppstoreFieldConfiguration[key]);
        angular.forEach(validChoices, function(choices, name) {
          if (fields.options.hasOwnProperty(name)) {
            fields.options[name].choices = choices;
          }
        });
        this.fields = fields;
      },
      getServiceTypeDisplay: ncServiceUtils.getTypeDisplay,
      getServiceIcon: ncServiceUtils.getServiceIcon,
      formatResourceType: resourceUtils.formatResourceType,
      serviceClass: function(service) {
        return {
          state: this.selectedService === service,
          disabled: !service.enabled,
          warning: !!service.warning,
          provider: this.selectedCategory.type === 'provider'
        };
      },
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

        var projectsPromise = vm.loadProjectWithServices(),
            supportPromise = premiumSupportPlansService.getList(),
          listPromises = $q.all([projectsPromise, supportPromise]);
        listPromises.then(function(entities) {
          var supportList = entities[1];
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
          vm.addSupportCategory(supportList);
          vm.setCategoryFromParams();
        });
        ncUtils.blockElement('store-content', listPromises);
      },
      setCategoryFromParams: function() {
        var vm = this;
        if ($stateParams.category) {
          for (var i = 0; i < vm.categories.length; i++) {
            var category = vm.categories[i];
            if (category.key === $stateParams.category) {
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
      addSupportCategory: function(list) {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
            vm.loadingProviders = false;
            if (list.length != 0) {
              var category = {
                type: 'package',
                name: 'Support',
                icon: 'wrench',
                key: 'support',
                packages: list
              };
              vm.categories.push(category);
            }
        } else {
          vm.loadingProviders = false;
        }
      },
      selectSupportPackage: function(supportPackage) {
        this.agreementShow = true;
        this.selectedPackage = supportPackage;
      },
      signContract: function() {
        var contract = premiumSupportContractsService.$create();
        contract.project = this.currentProject.url;
        contract.plan = this.selectedPackage.url;
        var vm = this;
        return contract.$save().then(function(response) {
          premiumSupportContractsService.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshProjectList');
          $state.go('project.support', {uuid: vm.currentProject.uuid});
          return true;
        }, function(response) {
          vm.errors = response.data;
          vm.onError();
        });
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
          return "Instance is not configured";
        }
        var fields = [];
        for (var name in this.allFormOptions) {
          var options = this.allFormOptions[name];
          if (options.required && !this.instance[name]) {
            fields.push(options.label);
          }
        }
        if (fields.length > 0) {
          return "Please specify " + fields.join(", ").toLowerCase();
        }
      },
      getResourceUrl: function() {
        if (this.selectedResourceType === 'Tenant') {
          return ENV.apiEndpoint + 'api/openstack-packages/';
        }
        return this.serviceMetadata.resources[this.selectedResourceType];
      },
      saveInstance: function() {
        var resourceUrl = this.getResourceUrl();
        var instance = servicesService.$create(resourceUrl);
        instance.service_project_link = this.selectedService.service_project_link_url;

        for (var name in this.allFormOptions) {
          if (this.instance.hasOwnProperty(name)) {
            var value = this.instance[name];
            if (value.hasOwnProperty('url')) {
              value = value.url;
            }
            instance[name] = value;
          }
        }
        return instance.$save();
      },
      save: function() {
        if (this.instance.password !== this.instance.repeat_password) {
          this.errors.password = ['The passwords you have entered do not match.'];
          this.onError();
          return $q.reject();
        } else {
          delete this.instance.repeat_password;
        }
        return this._super();
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
        if (this.isSupportSelected()) {
          return $state.go('project.support', {uuid: this.currentProject.uuid});
        } else if (this.selectedResourceType === 'Tenant') {
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
})();
