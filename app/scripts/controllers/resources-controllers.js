'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ResourceListController', ['resourcesService', ResourceListController]);

  function ResourceListController(resourcesService) {
    var vm = this;
    vm.list = {};
    vm.stopResource = stopResource;
    vm.startResource = startResource;
    vm.restartResource = restartResource;

    resourcesService.getResourcesList().then(function(response){
      console.log(response);
      vm.list = response;
    });

    function stopResource(resource) {
      resourceService.stopResource(resource);
    }

    function startResource(resoruce) {
      resourcesService.startResource(resource);
    }

    function restartResource(resource) {
      resourceService.restartResource(resource);
    }
  }
})();
