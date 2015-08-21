'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ImportResourceController',
      ['baseControllerClass',
      'digitalOceanLinkService',
      'resourcesService',
      'ENV',
      'servicesService',
      'currentStateService',
      ImportResourceController]);

  function ImportResourceController(
    baseControllerClass,
    digitalOceanLinkService,
    resourcesService,
    ENV,
    servicesService,
    currentStateService
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
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(controllerScope));
        this.setSignalHandler('currentProjectUpdated', this.setProject.bind(controllerScope));
        this.activate();
        this._super();
      },

      activate: function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesList = response;
        });
        vm.setProject();
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
                && category.services
                && (category.services.indexOf(service.type) + 1)
              ) {
                vm.services[category.name].push(service);
              }
            }
            if (vm.services[category.name].length > 0 || category.name == 'SUPPORT') {
              vm.categories.push(category);
            }
          }
          if (vm.categories.length == 0) {
            alert("No providers!");
            $state.go('resources.list', {tab: 'Providers'});
          }
        });
      },
      setCategory: function(category) {
        this.selectedCategory = category;
        this.secondStep = true;
        this.selectedService = {};
        this.selectedServiceName = null;
        this.importableResources = [];
        this.selectedResources = [];
        this.importedResources = [];
      },

      currentCustomerUpdatedHandler: function() {
        this.activate();
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
        this.getResourcesForService(service);
        this.getImportedResourcesForService(service);
      },

      getImportedResourcesForService: function(service) {
        var self = this;
        controllerScope.importedResources = [];
        var query = {'resource_type': service.type.toLowerCase(), 'service_uuid': service.uuid};
        resourcesService.getList(query).then(function(response) {
          controllerScope.importedResources = response;
        }, function(){
          self.flashMessage('warning', 'Unable to get list of imported resources');
        });
      },

      getResourcesForService: function(service) {
        var self = this;
        controllerScope.importableResources = [];
        controllerScope.noResources = false;
        servicesService.getList({operation: 'link'}, service.url).then(function(response) {
          for (var i = 0; i < response.length; i++) {
            response[i].status = 'ready';
          }
          controllerScope.importableResources = response;
          if (response.length == 0){
            controllerScope.noResources = true;
          }
        }, function(){
          controllerScope.noResources = true;
          self.flashMessage('warning', 'Unable to get list of resources for service');
        });
      },

      canImport: function() {
        return controllerScope.currentProject && controllerScope.selectedResources.length;
      },

      save: function() {
        var self = this;
        var service_uuid = controllerScope.selectedService.uuid;
        var project_url = controllerScope.currentProject.url;

        controllerScope.selectedResources.map(function(resource){
          resource.status = 'progress';
          digitalOceanLinkService.add({
            service_uuid: service_uuid,
            project_url: project_url,
            droplet_id: resource.id
          }).then(function(){
            resource.status = 'success';
            self.toggleResource(resource);
          }, function(){
            self.flashMessage('warning', 'Unable to import resource ' + resource.name);
            resource.status = 'failed';
          })
        });

        self.flashMessage('success', 'Wait while importing resources');
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();
