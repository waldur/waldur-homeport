'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController', ['$location', 'projectsService', 'usersService', ProjectListController]);

  function ProjectListController($location, projectsService, usersService) {

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
    .controller('ProjectAddController', ['$location', 'projectsService', 'customersService', ProjectAddController]);

  function ProjectAddController($location, projectsService, customersService) {
    var vm = this;

    vm.project = new projectsService.projectResource();
    vm.customersList = customersService.customerResource.query();
    vm.save = save;

    function save() {
      vm.project.$save();
    }

  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$location',
      '$routeParams',
      'projectsService',
      'usersService',
      'cloudsService',
      'customersService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController(
      $location, $routeParams, projectsService, usersService, cloudsService, customersService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.project = projectsService.projectResource.get({projectUUID: $routeParams.uuid}, initProjectElemetns);
    vm.update = update;

    function initProjectElemetns(project) {
      vm.users = usersService.userResource.query({project: project.name});
      vm.clouds = cloudsService.cloudResource.query({project: project.uuid});
      /*jshint camelcase: false */
      customersService.customerResource.query({name: project.customer_name}, function(list) {
        vm.customer = list[0];
      });
      /*jshint camelcase: true */
    }

    function update() {
      /* jshint camelcase: false */
      vm.project.name = vm.project_new_name;
      /* jshint camelcase: true */
      vm.project.$update();
    }

  }

})();
