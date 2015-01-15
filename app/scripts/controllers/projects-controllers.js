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

    vm.deleteProject = function(project) {
      var index = vm.list.indexOf(project)
      project.$delete(function(success) {
        vm.list.splice(index, 1);
      });
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

  angular.module('ncsaas')
    .controller('ProjectController', ['$location', '$routeParams', 'projectsService', 'usersService', ProjectController]);

  function ProjectController($location, $routeParams, projectsService, usersService) {
    var vm = this;

    // get project
    vm.project = projectsService.projectResource.get({projectUUID: $routeParams.uuid});

    // get users
    vm.project.$promise.then(function(data){
      vm.users = usersService.userResource.query({project: data.name, isArray: true});
    });

    // tabs
    vm.activeTab = 'eventlog';

  }

})();
