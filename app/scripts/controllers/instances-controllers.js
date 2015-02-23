'use strict';

(function() {
  angular.module('ncsaas')
    .controller('InstanceListController', ['$location', 'instancesService', InstanceListController]);

  function InstanceListController($location, instancesService) {
    var vm = this;

    vm.list = instancesService.getInstanceList();
    vm.remove = remove;

    function remove(instance) {
      var index = vm.list.indexOf(instance);

      instance.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

})();

// TODO: move this controller to other resource controllers.
(function() {
  angular.module('ncsaas')
    .controller('ResourceAddController',
      ['$location', 'resourceService', 'projectsService', ResourceAddController]);

  function ResourceAddController($location, resourceService, projectsService) {
    var vm = this;

    vm.projects = projectsService.getRawProjectList();

  }

})();
