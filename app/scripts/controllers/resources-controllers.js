'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ResourceListController', ['resourcesService', ResourceListController]);

  function ResourceListController(resourcesService) {
    var vm = this;

    vm.list = {};

    // resource operations
    vm.stopResource = stopResource;
    vm.startResource = startResource;
    vm.restartResource = restartResource;
    vm.deleteResource = deleteResource;
    vm.isOperationAvailable = isOperationAvailable;

    // search
    vm.searchInput = '';
    vm.search = search;

    // pagination
    vm.changePageSize = changePageSize;
    vm.changePage = changePage;
    vm.getNumber = getNumber;
    vm.pageSizes = [1,5,10,15,20];
    vm.currentPageSize = resourcesService.pageSize;
    vm.pages = resourcesService.pages ? resourcesService.pages : 5;
    vm.currentPage = resourcesService.page;

    getResourceList();

    function getResourceList() {
      resourcesService.getResourcesList().then(function(response) {
        vm.pages = resourcesService.pages;
        vm.list = response;
      });
    }


    resourcesService.getResourcesList().then(function(response) {
      vm.list = response;
    });


    function stopResource(uuid) {
      resourcesService.stopResource(uuid);
    }

    function startResource(uuid) {
      resourcesService.startResource(uuid);
    }

    function restartResource(uuid) {
      resourcesService.restartResource(uuid);
    }


    function deleteResource(uuid, index) {
      var confirmDelete = confirm('Confirm resource deletion?');
      if (confirmDelete) {
        resourcesService.deleteResource(uuid).then(function(response){
          vm.list.splice(index, 1);
        });
      } else {
        alert('Resource was not deleted.');
      }
    }

    function search() {
      resourcesService.getResourcesList({hostname: vm.searchInput}).then(function(response) {
        vm.list = response;
      });
    }

    function changePageSize(pageSize) {
      vm.currentPageSize = pageSize;
      vm.currentPage = 1;
      resourcesService.page = 1;
      resourcesService.pageSize = pageSize;
      getResourceList();
    }

    function changePage(page) {
      vm.currentPage = page;
      resourcesService.page = page;
      getResourceList();
    }

    function getNumber(num) {
      return new Array(num);
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
      ['$state', 'resourcesService', 'servicesService', 'projectsService', 'keysService', 'templatesService',
      ResourceAddController]);

  function ResourceAddController(
      $state, resourcesService, servicesService, projectsService, keysService, templatesService) {
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
    vm.resource = resourcesService.createResource();
    vm.save = save;
    vm.cancel = cancel;
    vm.errors = {};
    vm.selectedProject = null;

    function activate() {
      // projects
      projectsService.getProjectList().then(function(response) {
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
      servicesService.getServiceList({project: project.uuid}).then(function(response) {
        vm.serviceList = response;
      });
    }

    function save() {
      vm.resource.$save(success, error);

      function success(response) {
        $state.go('resources');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

    function cancel() {
      $state.go('resources');
    }

    activate();

  }
})();
