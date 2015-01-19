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

  angular.module('ncsaas')
    .controller('ProjectController', [
      '$location',
      '$routeParams',
      'projectsService',
      'usersService',
      'cloudsService',
      'customersService',
      ProjectController
    ]);

  function ProjectController($location, $routeParams, projectsService, usersService, cloudsService, customersService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.project = projectsService.projectResource.get({projectUUID: $routeParams.uuid}, initProjectElemetns);
    vm.update = update;

    function initProjectElemetns(project) {
      vm.users = usersService.userResource.query({project: project.name});
      vm.clouds = cloudsService.cloudResource.query({project: project.uuid});
      vm.customer;
      customersService.customerResource.query({name: project.customer_name}, function(list) {
        vm.customer=list[0];
      });
    }

    function update() {
      vm.project.name = vm.project_new_name;
      vm.project.$update();
    }

  }

})();
