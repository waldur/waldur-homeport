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
    .controller('AddProjectsController', ['$location', 'projectsService', AddProjectsController]);

  function AddProjectsController($location, projectsService) {
    var vm = this;

    vm.project = new projectsService.projectResource();

    vm.initAddProject = function() {
      vm.project.$save();
    };

  }

})();
