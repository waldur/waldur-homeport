'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ImportResourceController',
      ['baseControllerClass',
      'resourcesService',
      'priceEstimationService',
      'ENV',
      'servicesService',
      'currentStateService',
      'usersService',
      '$state',
      '$filter',
      '$q',
      'ncUtils',
      'ncUtilsFlash',
      '$rootScope',
      ImportResourceController]);

  function ImportResourceController(
    baseControllerClass,
    resourcesService,
    priceEstimationService,
    ENV,
    servicesService,
    currentStateService,
    usersService,
    $state,
    $filter,
    $q,
    ncUtils,
    ncUtilsFlash,
    $rootScope
    ) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      selectedResources: [],
      importableResources: [],
      importedResources: [],
      noResources: false,
      servicesList: null,
      selectedCategory: null,
      services: [],

      init: function() {
        this.controllerScope = controllerScope;
        this.activate();
        this._super();
      },

      activate: function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesList = response;
        });
        currentStateService.getCustomer().then(function(customer) {
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
            $state.go('resources.list', {tab: 'providers'});
          }
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
      toggleResource: function(resource){
        if (resource.status == 'ready' || resource.status == 'success'){
          controllerScope.selectedResources = [];
          resource.checked =! resource.checked;
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
        var resourcesForServicePromise = this.getResourcesForService(service),
          importedResourcesPromise= this.getImportedResourcesForService(service),
          resourcesPromises = $q.all([resourcesForServicePromise, importedResourcesPromise]);
        ncUtils.blockElement('import-second-step', resourcesPromises);
      },

      getImportedResourcesForService: function(service) {
        controllerScope.importedResources = [];
        return resourcesService.getImportedResources(service).then(function(resources) {
          controllerScope.importedResources = resources;
        }, function() {
          ncUtilsFlash.warning('Unable to get list of imported resources');
        });
      },

      getResourcesForService: function(service) {
        controllerScope.importableResources = [];
        controllerScope.noResources = false;
        var query = {operation: 'link', project_uuid: controllerScope.currentProject.uuid};
        return servicesService.getList(query, service.url).then(function(response) {
          for (var i = 0; i < response.length; i++) {
            response[i].status = 'ready';
          }
          controllerScope.importableResources = response;
          if (response.length == 0){
            controllerScope.noResources = true;
          }
        }, function(){
          controllerScope.noResources = true;
          ncUtilsFlash.warning('Unable to get list of resources for service');
        });
      },

      getResourceDetails: function(resource) {
        var str = 'CPU: ' + resource.cores;
        if (resource.ram) {
          str += ' / RAM: ' + $filter('mb2gb')(resource.ram);
        }
        if (resource.disk) {
          str += ' / HDD: ' + $filter('mb2gb')(resource.disk);
        }
        if (resource.flavor_name) {
          str += ' / Flavor: ' + resource.flavor_name;
        }
        return str;
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

        if (angular.isDefined(resource.type)) {
          instance.type = resource.type;
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
        if (this.isVirtualMachinesSelected()) {
          return ENV.resourcesTypes.vms;
        }
        if (this.isApplicationSelected()) {
          return ENV.resourcesTypes.applications;
        }
      },

      isVirtualMachinesSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.VirtualMachines].name;
      },

      isApplicationSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.Applications].name;
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();
