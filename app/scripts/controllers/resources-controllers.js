'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ResourceListController', ['resourcesService', ResourceListController]);

  function ResourceListController(resourcesService) {
    var vm = this;
    vm.list = {};
    resourcesService.getResourcesList().then(function(response){
      vm.list = response;
    });
    vm.remove = remove;

    function remove(resource) {
      var index = vm.list.indexOf(resource);
      resource.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }
})();
