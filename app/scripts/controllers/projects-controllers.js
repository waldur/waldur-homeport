'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsController', ['$location', 'projectsService', 'usersService', ProjectsController]);

  function ProjectsController($location, projectsService, usersService) {
    var vm = this;

    // project list
    vm.list = projectsService.projectResource.query();
    vm.list.$promise.then(function(projects) {
      for (var i=0; i < projects.length; i++) {
        var project;
        project = projects[i];
        var usersList = usersService.userResource.query({project: projects[i].name});
        project.users = usersList;
      }
    });

    // project delete
    vm.remove = function(project) {
      project.$delete();
    }
    
  }

  angular.module('ncsaas')
    .controller('AddProjectsController', ['$location', 'projectsService', 'customersService', AddProjectsController]);

  function AddProjectsController($location, projectsService, customersService) {
    var vm = this;

    vm.project = new projectsService.projectResource();
    vm.customersList = customersService.customerResource.query();

    vm.initAddProject = function() {
      vm.project.$save(function() {
        console.log('project added');
      });
    };

  }

})();
