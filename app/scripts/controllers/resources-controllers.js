'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ResourceListController', ['baseControllerListClass', 'resourcesService', ResourceListController]);

  function ResourceListController(baseControllerListClass, resourcesService) {
    var controllerScope = this;
    var ResourceController = baseControllerListClass.extend({
      init:function() {
        var vm = this;
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'hostname';
      },
      stopResource:function(resource) {
        var vm = this;
        resourcesService.stopResource(resource.uuid).then(
          vm.reInitResource.bind(null, resource), vm.handleActionException);
      },
      startResource:function(resource) {
        var vm = this;
        resourcesService.startResource(resource.uuid).then(
          vm.reInitResource.bind(null, resource), vm.handleActionException);
      },
      restartResource:function(resource) {
        var vm = this;
        resourcesService.restartResource(resource.uuid).then(
          vm.reInitResource.bind(null, resource), vm.handleActionException);
      },
      isOperationAvailable:function(resource, operation) {
        var availableOperations = resourcesService.getAvailableOperations(resource);
        operation = operation.toLowerCase();
        return availableOperations.indexOf(operation) !== -1;
      },
      reInitResource:function(resource) {
        var vm = this;
        resourcesService.$get(resource.uuid).then(function(response) {
          var index = vm.list.indexOf(resource);
          vm.list[index] = response;
        });
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceAddController',
    ['resourcesService', 'servicesService', 'projectsService', 'keysService', 'templatesService', 'baseControllerAddClass',
      ResourceAddController]);

  function ResourceAddController(
    resourcesService, servicesService, projectsService, keysService, templatesService, baseControllerAddClass) {
    var controllerScope = this;
    var ResourceController = baseControllerAddClass.extend({
      showFlavors: false,
      showTemplates: false,

      serviceList: {},
      flavorList: {},
      keyList: {},
      projectList: {},
      templateList:{},
      selectedProject: null,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'resources.list';
        this.resource = this.instance;
      },
      activate:function() {
        var vm = this;
        // projects
        projectsService.getList().then(function(response) {
          vm.projectList = response;
        });
        // keys
        keysService.getCurrentUserKeyList().then(function(response) {
          vm.keyList = response;
        });
      },
      setService:function(service) {
        var vm = this;
        vm.flavorList = service.flavors;
        templatesService.getTemplateList(service.uuid).then(function(response) {
          vm.templateList = response;
        });
        vm.selectedService = service;
        vm.showTemplates = true;
      },
      setTemplate:function(tamplate) {
        var vm = this;
        vm.resource.template = tamplate.url;
        vm.selectedTemplate = tamplate;
        vm.showFlavors = true;
      },
      setFlavor:function(flavor) {
        var vm = this;
        vm.resource.flavor = flavor.url;
        vm.selectedFlavor = flavor;
      },
      setProject:function(project) {
        var vm = this;
        if (project) {
          vm.resource.project = project.url;
          // services
          servicesService.getList({project: project.uuid}).then(function(response) {
            vm.serviceList = response;
          });
        } else {
          vm.serviceList = {};
        }
      },
      setSignals: function() {
        var vm = this._super();
        this._signals.currentCustomerUpdated = function() {
          vm.showFlavors = false;
          vm.showTemplates = false;
          vm.selectedProject = null;
          vm.serviceList = {};
          vm.flavorList = {};
          vm.keyList = {};
          vm.projectList = {};
          vm.templateList = {};
          vm.activate();
        };
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }
})();
