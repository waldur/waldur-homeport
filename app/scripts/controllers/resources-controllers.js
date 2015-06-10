'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController', ['baseControllerListClass', baseResourceListController]);

  // need for resource tab
  function baseResourceListController(baseControllerListClass) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this._super();
        this.searchFieldName = 'name';
        this.actionButtonsListItems = [
          {
            title: 'Start',
            clickFunction: this.startResource.bind(this.controllerScope),
            isDisabled: this.isOperationAvailable.bind(this.controllerScope, 'start')
          },
          {
            title: 'Stop',
            clickFunction: this.stopResource.bind(this.controllerScope),
            isDisabled: this.isOperationAvailable.bind(this.controllerScope, 'stop')
          },
          {
            title: 'Restart',
            clickFunction: this.restartResource.bind(this.controllerScope),
            isDisabled: this.isOperationAvailable.bind(this.controllerScope, 'restart')
          },
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),
            className: 'remove'
          }
        ];
      },
      stopResource:function(resource) {
        var vm = this;
        vm.service.stopResource(resource.uuid).then(
          vm.reInitResource.bind(null, resource), vm.handleActionException);
      },
      startResource:function(resource) {
        var vm = this;
        vm.service.startResource(resource.uuid).then(
          vm.reInitResource.bind(null, resource), vm.handleActionException);
      },
      restartResource:function(resource) {
        var vm = this;
        vm.service.restartResource(resource.uuid).then(
          vm.reInitResource.bind(null, resource), vm.handleActionException);
      },
      isOperationAvailable:function(operation, resource) {
        var availableOperations = this.service.getAvailableOperations(resource);
        operation = operation.toLowerCase();
        return availableOperations.indexOf(operation) !== -1;
      },
      reInitResource:function(resource) {
        var vm = this;
        vm.service.$get(resource.uuid).then(function(response) {
          var index = vm.list.indexOf(resource);
          vm.list[index] = response;
        });
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('ResourceListController', ['baseResourceListController', 'resourcesService', ResourceListController]);

  function ResourceListController(baseResourceListController, resourcesService) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceAddController',
    ['resourcesService', 'projectCloudMembershipsService', 'projectsService',
      'keysService', 'templatesService', 'baseControllerAddClass', 'servicesService',
      ResourceAddController]);

  function ResourceAddController(
    resourcesService, projectCloudMembershipsService, projectsService, keysService,
    templatesService, baseControllerAddClass, servicesService) {
    var controllerScope = this;
    var ResourceController = baseControllerAddClass.extend({
      showServices: false,
      showFlavors: false,
      showTemplates: false,
      showKeys: false,

      serviceList: {},
      flavorList: {},
      keyList: {},
      projectList: {},
      templateList:{},
      selectedProject: null,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
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
      setService:function(projectCloudMemberships) {
        var vm = this;
        var url = projectCloudMemberships.cloud,
          array = url.split ('/').filter(function(el) {
            return el.length !== 0;
          }),
          uuid = array[4];
        servicesService.$get(uuid).then(function(response) {
          var service = response;
          vm.flavorList = service.flavors;
          templatesService.getList({cloud: service.uuid}).then(function(response) {
            vm.templateList = response;
          });
          vm.selectedService = projectCloudMemberships;
          vm.showTemplates = true;
        });
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
        vm.showKeys = true;
      },
      setProject:function(project) {
        var vm = this;
        if (project) {
          vm.resource.project = project.url;
          vm.showServices = true;
          // projectCloudMemberships
          projectCloudMembershipsService.getList({project: project.uuid}).then(function(response) {
            vm.serviceList = response;
          });
        } else {
          vm.serviceList = {};
        }
      },
      setKey:function(key) {
        var vm = this;
        vm.resource.ssh_public_key = key.url;
        vm.selectedKey = key;
      },
      currentCustomerUpdatedHandler:function() {
        var vm = this.controllerScope;
        vm.showFlavors = false;
        vm.showTemplates = false;
        vm.selectedProject = null;
        vm.serviceList = {};
        vm.flavorList = {};
        vm.keyList = {};
        vm.projectList = {};
        vm.templateList = {};
        vm.activate();
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }
})();
