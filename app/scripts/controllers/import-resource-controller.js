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
        this.activate();
        this.categories = ENV.appStoreCategories;
        this._super();
      },

      activate: function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesList = response;
        });
        currentStateService.getProject().then(function(response) {
          vm.selectedProject = response;
        });
        vm.secondStep = false;
        vm.selectedCategory = null;
        vm.importableResources = [];
      },
      setCategory: function(category) {
        this.selectedCategory = category;
        this.secondStep = true;
        this.selectedService = {};
        this.selectedServiceName = null;
        this.importableResources = [];

        var vm = this;
        vm.services = [];
        if (vm.selectedCategory.services) {
          for (var i = 0; i < vm.selectedCategory.services.length; i++) {
            var url = vm.servicesList[vm.selectedCategory.services[i]].url;
            servicesService.getList(null, url).then(function(response) {
              for (var j = 0; j < response.length; j++) {
                vm.services.push(response[j]);
              }
            });
          }
        }
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
        controllerScope.selectedService = service;
        this.getResourcesForService(service);
        this.getImportedResourcesForService(service);
      },

      getImportedResourcesForService: function(service) {
        var self = this;
        controllerScope.importedResources = [];
        var query = {'resource_type': this.getProviderEndpoint(service), 'service_uuid': service.uuid};
        resourcesService.getList(query).then(function(response){
          controllerScope.importedResources = response;
        }, function(){
          self.flashMessage('warning', 'Unable to get list of imported resources');
        });
      },

      // TODO: remove this function when resource_type will 
      getProviderEndpoint: function(service) {
        var splitUrl = service.url.split('/');
        return splitUrl[4];
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
        return controllerScope.selectedProject && controllerScope.selectedResources.length;
      },

      save: function() {
        var self = this;
        var service_uuid = controllerScope.selectedService.uuid;
        var project_url = controllerScope.selectedProject.url;

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
