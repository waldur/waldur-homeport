'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ImportResourceController',
      ['baseControllerClass',
      'resourcesService',
      'resourceUtils',
      'priceEstimationService',
      'ENV',
      'servicesService',
      'currentStateService',
      'usersService',
      '$state',
      '$filter',
      '$scope',
      '$q',
      'ncUtils',
      'ncUtilsFlash',
      '$rootScope',
      '$stateParams',
      ImportResourceController]);

  function ImportResourceController(
    baseControllerClass,
    resourcesService,
    resourceUtils,
    priceEstimationService,
    ENV,
    servicesService,
    currentStateService,
    usersService,
    $state,
    $filter,
    $scope,
    $q,
    ncUtils,
    ncUtilsFlash,
    $rootScope,
    $stateParams
    ) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      selectedResources: [],
      importableResources: [],
      importedResources: [],
      noResources: false,
      selectedCategory: null,
      services: {},

      init: function() {
        this.controllerScope = controllerScope;
        this.activate();
        this._super();
      },

      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
          if (customer.projects.length == 0) {
            ncUtilsFlash.error("No projects!");
            $state.go('organizations.details', {uuid: customer.uuid, tab: 'projects'});
          } else {
            vm.setProject();
          }
        });
        vm.secondStep = false;
        vm.selectedCategory = null;
        vm.importableResources = [];
      },
      setProject: function() {
        var vm = this;
        vm.categories = [];
        var categories = ENV.appStoreCategories;
        currentStateService.getProject().then(function(response) {
          vm.currentProject = response;
          for (var j = 0; j < categories.length; j++) {
            var category = categories[j];
            vm.services[category.name] = [];
            for (var i = 0; i < vm.currentProject.services.length; i++) {
              var service = vm.currentProject.services[i];
              if (service.state != 'Erred'
                && category.services && (category.services.indexOf(service.type) + 1)
                && (!service.shared || usersService.currentUser.is_staff)
              ) {
                vm.services[category.name].push(service);
              }
            }
            if (vm.services[category.name].length > 0) {
              vm.categories.push(category);
            }
          }
          if (vm.categories.length == 0) {
            ncUtilsFlash.error("No providers!");
            $state.go('organizations.details', {uuid: vm.customer.uuid, tab: 'providers'});
          }
          vm.setRoutedService();
        });
      },
      setCategory: function(category) {
        this.selectedCategory = category;
        this.secondStep = true;
        this.selectedService = {};
        this.importableResources = [];
        this.selectedResources = [];
        this.importedResources = [];
      },
      getCategoryForServiceType: function(service_type) {
        var categories = ENV.appStoreCategories;
        for (var j = 0; j < categories.length; j++) {
          var category = categories[j];
          if (category.services.indexOf(service_type) !== -1) {
            return category.name;
          }
        }
      },
      setCategoryByName: function(name) {
        for (var j = 0; j < this.categories.length; j++) {
          var category = this.categories[j];
          if (category.name === name) {
            this.setCategory(category);
            return;
          }
        }
      },
      setRoutedService: function() {
        if (!$stateParams.service_type || !$stateParams.service_uuid) {
          return;
        }
        var categoryName = this.getCategoryForServiceType($stateParams.service_type);
        if (!categoryName) {
          return;
        }
        this.setCategoryByName(categoryName);

        var services = this.services[categoryName];
        for (var j = 0; j < services.length; j++) {
          var service = services[j];
          if (service.type == $stateParams.service_type &&
              service.uuid == $stateParams.service_uuid) {
            this.setService(service);
            return;
          }
        }
      },
      toggleResource: function(resource, checked){
        if (resource.status == 'ready' || resource.status == 'success'){
          controllerScope.selectedResources = [];
          if (angular.isDefined(checked)) {
            resource.checked = checked;
          } else {
            resource.checked =! resource.checked;
          }
          for (var i = 0; i < controllerScope.importableResources.length; i++) {
            if (controllerScope.importableResources[i].checked){
              controllerScope.selectedResources.push(controllerScope.importableResources[i]);
            }
          }
        }
      },
      setService: function(service) {
        this.importableResources = [];
        this.selectedResources = [];
        this.importedResources = [];
        controllerScope.selectedService = service;
        if (service.type === 'OpenStack' && this.selectedCategory.name === 'VMs') {
          this.selectTenant = true;
          this.loadTenants();
          return;
        } else {
          this.selectTenant = false;
        }
        var resourcesForServicePromise = this.getResourcesForService(service),
          importedResourcesPromise = this.getImportedResourcesForService(service),
          resourcesPromises = $q.all([resourcesForServicePromise, importedResourcesPromise]);
        ncUtils.blockElement('import-second-step', resourcesPromises);
      },

      loadTenants: function() {
        this.selectedTenant = null;
        this.tenants = null;
        var query = {
          service_uuid: this.selectedService.uuid,
          project_uuid: this.currentProject.uuid
        };
        var url = ENV.apiEndpoint + 'api/openstack-tenants/';
        servicesService.getList(query, url).then(function(tenants) {
          this.tenants = tenants;
        }.bind(this), function() {
          ncUtilsFlash.warning('Unable to get list of tenants.');
        });
      },

      setTenant: function(tenant) {
        this.selectedTenant = tenant;
        var promise = this.getResourcesForService(
          this.selectedService, {
            tenant_uuid: tenant.uuid,
            resource_type: 'OpenStack.Instance'
          }
        );
        ncUtils.blockElement('import-second-step', promise);
      },

      getImportedResourcesForService: function(service) {
        controllerScope.importedResources = [];
        return resourcesService.getImportedResources(
          service, controllerScope.currentProject.uuid).then(function(resources) {
          controllerScope.importedResources = resources;
        }, function() {
          ncUtilsFlash.warning('Unable to get list of imported resources');
        });
      },

      getResourcesForService: function(service, extra) {
        controllerScope.importableResources = [];
        controllerScope.noResources = false;
        var query = angular.extend({
          operation: 'link',
          project_uuid: controllerScope.currentProject.uuid
        }, extra);
        if (service.type == 'Amazon') {
          query.resource_type = 'Amazon.Instance';
        }
        return servicesService.getList(query, service.url).then(function(resources) {
          for (var i = 0; i < resources.length; i++) {
            resources[i].status = 'ready';
          }
          angular.forEach(resources, function(resource) {
            resource.icon = resourceUtils.getIcon(resource);
            resource.details = resourceUtils.getSummary(resource);
          });
          controllerScope.importableResources = resources;
          if (resources.length == 0){
            controllerScope.noResources = true;
          }
        }, function(){
          controllerScope.noResources = true;
          ncUtilsFlash.warning('Unable to get list of resources for service');
        });
      },

      canImport: function() {
        return controllerScope.currentProject && controllerScope.selectedResources.length;
      },

      save: function() {
        var savePromise = this.importSelectedResources();
        ncUtils.blockElement('import-second-step', savePromise);
        return savePromise.then(this.onSuccess.bind(this));
      },

      importSelectedResources: function() {
        var promises = this.selectedResources.map(this.importResource.bind(this));
        return $q.all(promises);
      },

      importResource: function(resource) {
        var vm = this;
        resource.status = 'progress';
        return this.createInstance(resource).$save().then(function() {
          resource.status = 'success';
          vm.toggleResource(resource);
        }, function() {
          ncUtilsFlash.warning('Unable to import resource ' + resource.name);
          resource.status = 'failed';
        });
      },

      createInstance: function(resource) {
        var service_url = this.selectedService.url;
        var project_url = this.currentProject.url;
        var instance = servicesService.$create(service_url + 'link/');

        instance.project = project_url;
        instance.backend_id = resource.id;

        if (resource.type) {
          instance.type = resource.type;
          instance.resource_type = resource.type;
        }
        if (this.selectedTenant) {
          instance.tenant = this.selectedTenant.url;
        }
        return instance;
      },

      onSuccess: function() {
        resourcesService.clearAllCacheForCurrentEndpoint();
        priceEstimationService.clearAllCacheForCurrentEndpoint();
        $rootScope.$broadcast('refreshCounts');
        $state.go('projects.details', {
          uuid: this.currentProject.uuid,
          tab: this.getTab()
        });
      },

      getTab: function() {
        if (this.isApplicationSelected()) {
          return ENV.resourcesTypes.applications;
        } else if (this.isPrivateCloudSelected()) {
          return ENV.resourcesTypes.privateClouds;
        } else {
          return ENV.resourcesTypes.vms;
        }
      },

      isPrivateCloudSelected: function() {
        return this.selectedCategory.name === ENV.appStoreCategories[ENV.PrivateClouds].name;
      },

      isVirtualMachinesSelected: function() {
        return this.selectedCategory.name === ENV.appStoreCategories[ENV.VirtualMachines].name;
      },

      isApplicationSelected: function() {
        return this.selectedCategory.name === ENV.appStoreCategories[ENV.Applications].name;
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();
