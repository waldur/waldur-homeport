'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProjectListController', ['$location', 'projectsService', ProjectListController]);

  function ProjectListController($location, projectsService) {
    var vm = this;

    vm.list = projectsService.getProjectsList();
    vm.remove = remove;

    function remove(project) {
      var index = vm.list.indexOf(project);

      project.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

  angular.module('ncsaas')
    .controller('ProjectAddController', ['$location', 'projectsService', 'customersService', ProjectAddController]);

  function ProjectAddController($location, projectsService, customersService) {
    var vm = this;

    vm.project = projectsService.createProject();
    vm.customersList = customersService.getCustomersList();
    vm.save = save;

    function save() {
      // TODO: refactor this function to use named urls and uuid field instead - SAAS-108
      vm.project.$save(function() {
        var url = vm.project.url;
        var array = url.split ('/').filter(function(el) {
          return el.length != 0
        });
        var uuidNew = array[4];
        $location.path('/projects/' + uuidNew + '/');
      });
    }

  }

  angular.module('ncsaas')
    .controller('ProjectDetailUpdateController', [
      '$routeParams',
      '$rootScope',
      'projectsService',
      ProjectDetailUpdateController
    ]);

  function ProjectDetailUpdateController($routeParams, $rootScope, projectsService) {
    var vm = this;

    $rootScope.bodyClass = 'obj-view';

    vm.activeTab = 'eventlog';
    vm.project = projectsService.getProject($routeParams.uuid);
    vm.update = update;

    function update() {
      vm.project.$update();
    }

  }

})();
