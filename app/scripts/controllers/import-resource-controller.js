'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ImportResourceController',
      ['baseControllerClass',
      'digitalOceanLinkService',
      'digitalOceanResourcesService',
      'joinService',
      'joinServiceProjectLinkService',
      ImportResourceController]);

  function ImportResourceController(
    baseControllerClass,
    digitalOceanLinkService,
    digitalOceanResourcesService,
    joinService,
    joinServiceProjectLinkService
    ) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      selectedResources: [],
      importableResources: [],
      importedResources: [],
      noResources: false,

      init: function() {
        this.controllerScope = controllerScope;
        this.getServices();
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

      getServices: function() {
        var self = this;
        joinService.getList().then(function(response){
          controllerScope.services = response;
        }, function(){
          self.flashMessage('warning', 'Unable to get list of available services');
        });
      },

      setService: function(service) {
        controllerScope.selectedService = service;
        this.getResourcesForService(service);
        this.getImportedResourcesForService(service);
        this.getProjectsForService(service)
      },

      getImportedResourcesForService: function(service) {
        var self = this;
        controllerScope.importedResources = [];
        digitalOceanResourcesService.getList({service_uuid: service.uuid}).then(function(response){
          controllerScope.importedResources = response;
        }, function(){
          self.flashMessage('warning', 'Unable to get list of imported resources');
        });
      },

      getResourcesForService: function(service) {
        var self = this;
        controllerScope.importableResources = [];
        controllerScope.noResources = false;
        digitalOceanLinkService.getList({uuid: service.uuid}).then(function(response){
          for (var i = 0; i < response.length; i++) {
            response[i].status = 'ready';
          };
          controllerScope.importableResources = response;
          if (response.length == 0){
            controllerScope.noResources = true;
          }
        }, function(){
          controllerScope.noResources = true;
          self.flashMessage('warning', 'Unable to get list of resources for service');
        });
      },

      getProjectsForService: function(service) {
        var self = this;
        controllerScope.projectList = [];
        joinServiceProjectLinkService.getList(service).then(function(projects){
          controllerScope.projectList = projects;
          if (projects.length == 1) {
            controllerScope.selectedProject = projects[0];
          }
        }, function(){
          self.flashMessage('warning', 'Unable to get list of projects for service');
        });
      },

      canImport: function() {
        return controllerScope.selectedProject && controllerScope.selectedResources.length;
      },

      save: function() {
        var self = this;
        var service_uuid = controllerScope.selectedService.uuid;
        var project_url = controllerScope.selectedProject.url;
        var project_uuid = controllerScope.selectedProject.uuid;

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
        })

        self.flashMessage('success', 'Wait while importing resources');
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();