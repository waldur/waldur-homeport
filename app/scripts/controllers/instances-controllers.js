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
