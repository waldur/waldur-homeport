'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsController', ['$location', 'projectsService', ProjectsController]);

  function ProjectsController($location, projectsService) {
    var vm = this;

    vm.list = [];
    vm.initList = function() {vm.list = projectsService.projectResource.query();};
    
  }

  angular.module('ncsaas')
    .controller('AddProjectsController', ['$location', 'projectsService', 'customersService', AddProjectsController]);

  function AddProjectsController($location, projectsService, customersService) {
    var vm = this;

    vm.project = new projectsService.projectResource();

    vm.customersList = customersService.customerResource.query();

    console.log(vm.customersList);
    // vm.customersList = [];
    // vm.initCustomersList = function() {vm.customersList = customerssService.customerResource.query();};

    vm.initAddProject = function() {
      vm.project.$save();
    };

  }

})();
