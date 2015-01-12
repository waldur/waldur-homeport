'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsCtrl', ['$location', 'projectsService', ProjectsCtrl]);

  function ProjectsCtrl($location, projectsService) {
    var vm = this;

    vm.list = [];
    vm.initList = function() {vm.list = projectsService.projectResource.query();};
    
  }

  angular.module('ncsaas')
    .controller('AddProjectsCtrl', ['$location', 'projectsService', AddProjectsCtrl]);

  function AddProjectsCtrl($location, projectsService) {
    var vm = this;

    vm.project = new projectsService.projectResource();

    vm.initAddProject = function() {
      vm.project.$save();
    };

  }

})();
