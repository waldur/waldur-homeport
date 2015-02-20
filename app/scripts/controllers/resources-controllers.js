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

  }
})();
