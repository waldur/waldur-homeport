'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectsController', ['$location', 'projectsService', 'usersService', ProjectsController]);

  function ProjectsController($location, projectsService, usersService) {
    var vm = this;

    vm.list = projectsService.projectResource.query(initProjectUsers);
    vm.remove = remove;

    function initProjectUsers(projects) {
      for (var i = 0; i < projects.length; i++) {
        var project = projects[i];
        project.users = usersService.userResource.query({project: project.name});
      }
    }

    function remove(project) {
      var index = vm.list.indexOf(project);

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
    vm.save = save;

    function save() {
      vm.project.$save();
    }

  }

})();
