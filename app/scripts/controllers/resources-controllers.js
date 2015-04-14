'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ResourceListController', ['$rootScope', 'resourcesService', ResourceListController]);

  function ResourceListController($rootScope, resourcesService) {
    var vm = this;

    vm.list = {};
    vm.service = resourcesService;

    // resource operations
    vm.stopResource = stopResource;
    vm.startResource = startResource;
    vm.restartResource = restartResource;
    vm.deleteResource = deleteResource;
    vm.isOperationAvailable = isOperationAvailable;

    // view type
    vm.changeViewType = changeViewType();
    vm.showgroup = false;

    function changeViewType() {
      vm.showgroup = !vm.showgroup;
      console.log('sss');
    }

    // search
    vm.searchInput = '';
    vm.search = search;

    // initialization
    getResourceList();
    // handler
    $rootScope.$on('currentCustomerUpdated', function () {
      vm.service.page = 1;
      getResourceList();
    });

    function getResourceList() {
      resourcesService.getList().then(function(response) {
        vm.pages = resourcesService.pages;
        vm.list = response;
      });
    }

    function stopResource(resource) {
      resourcesService.stopResource(resource.uuid).then(
        reinitResource.bind(null, resource), handleResourceActionException);
    }

    function startResource(resource) {
      resourcesService.startResource(resource.uuid).then(
        reinitResource.bind(null, resource), handleResourceActionException);
    }

    function restartResource(resource) {
      resourcesService.restartResource(resource.uuid).then(
        reinitResource.bind(null, resource), handleResourceActionException);
    }

    function deleteResource(resource, index) {
      var confirmDelete = confirm('Confirm resource deletion?');
      if (confirmDelete) {
        resourcesService.$delete(resource.uuid).then(
          function(response) {
            vm.list.splice(index, 1);
          },
          handleResourceActionException
        );
      } else {
        alert('Resource was not deleted.');
      }
    }

    function reinitResource(resource, response) {
      resourcesService.$get(resource.uuid).then(function(response) {
        var index = vm.list.indexOf(resource);
        vm.list[index] = response;
      });
    }

    function handleResourceActionException(response) {
      if (response.status === 409) {
        var message = response.data.status || response.data.detail;
        alert(message);
      }
    }

    function search() {
      resourcesService.getList({hostname: vm.searchInput}).then(function(response) {
        vm.list = response;
      });
    }

    function isOperationAvailable(resource, operation) {
      var availableOperations = resourcesService.getAvailableOperations(resource);
      operation = operation.toLowerCase();
      return availableOperations.indexOf(operation) !== -1;
    }

  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceAddController',
      ['$rootScope', '$state',
       'resourcesService', 'servicesService', 'projectsService', 'keysService', 'templatesService',
        ResourceAddController]);

  function ResourceAddController(
      $rootScope, $state, resourcesService, servicesService, projectsService, keysService, templatesService) {
    var vm = this;

    // Resource add process:
    // 0. User has to choose back-end. Currently this step is not active because we have only one back-end.
    // 1. User has to choose project. Method setProject has to be called, because services are initiated based on
    // projects
    // 2. User has to choose service. Method setService has to be called, because flavors and templates are initialized
    // based on services
    // 3. User has to choose flavor, template, ssh key and other resource attributes.

    vm.showFlavors = false;
    vm.showTemplates = false;

    vm.serviceList = {};
    vm.flavorList = {};
    vm.keyList = {};
    vm.projectList = {};
    vm.templateList = {};
    vm.setService = setService;
    vm.setTemplate = setTemplate;
    vm.setFlavor = setFlavor;
    vm.setProject = setProject;
    vm.resource = resourcesService.$create();
    vm.save = save;
    vm.cancel = cancel;
    vm.errors = {};
    vm.selectedProject = null;

    $rootScope.$on('currentCustomerUpdated', function () {
      vm.showFlavors = false;
      vm.showTemplates = false;
      vm.selectedProject = null;
      vm.serviceList = {};
      vm.flavorList = {};
      vm.keyList = {};
      vm.projectList = {};
      vm.templateList = {};
      activate();
    });

    function activate() {
      // projects
      projectsService.getList().then(function(response) {
        vm.projectList = response;
      });
      // keys
      keysService.getCurrentUserKeyList().then(function(response) {
        vm.keyList = response;
      });
    }

    function setService(service) {
      vm.flavorList = service.flavors;
      templatesService.getTemplateList(service.uuid).then(function(response) {
        vm.templateList = response;
      });
      vm.selectedService = service;
      vm.showTemplates = true;
    }

    function setTemplate(tamplate) {
      vm.resource.template = tamplate.url;
      vm.selectedTemplate = tamplate;
      vm.showFlavors = true;
    }

    function setFlavor(flavor) {
      vm.resource.flavor = flavor.url;
      vm.selectedFlavor = flavor;
    }

    function setProject(project) {
      vm.resource.project = project.url;
      // services
      servicesService.getList({project: project.uuid}).then(function(response) {
        vm.serviceList = response;
      });
    }

    function save() {
      vm.resource.$save(success, error);

      function success(response) {
        $state.go('resources.list');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

    function cancel() {
      $state.go('resources.list');
    }

    activate();

  }
})();
