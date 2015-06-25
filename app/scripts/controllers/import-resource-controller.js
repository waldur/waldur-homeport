'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ImportResourceController',
      ['baseControllerClass',
      'digitalOceanLinkService',
      'joinService',
      'joinServiceProjectLinkService',
      ImportResourceController]);

  function ImportResourceController(
    baseControllerClass,
    digitalOceanLinkService,
    joinService,
    joinServiceProjectLinkService
    ) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      selectedResources: [],

      init: function() {
        this.controllerScope = controllerScope;
        this.getServices();
      },

      toggleResource: function(resource){
        controllerScope.selectedResources = [];
        resource.checked =! resource.checked;
        for (var i = 0; i < controllerScope.resources.length; i++) {
          if (controllerScope.resources[i].checked){
            controllerScope.selectedResources.push(controllerScope.resources[i]);
          }
        };
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
        this.getProjectsForService(service)
      },

      getResourcesForService: function(service) {
        var self = this;
        controllerScope.resources = [];
        digitalOceanLinkService.getList({uuid: service.uuid}).then(function(response){
          controllerScope.resources = response;
        }, function(){
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
        var service_uuid = controllerScope.selectedService.uuid;
        var project_url = controllerScope.selectedProject.url;
        var project_uuid = controllerScope.selectedProject.uuid;

        angular.forEach(controllerScope.selectedResources, function(droplet){
          digitalOceanLinkService.add({
            service_uuid: service_uuid,
            project_url: project_url,
            droplet_id: droplet.id
          });
        })
        $state.go('projects.details', {uuid: project_uuid, tab: 'resources'});
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();