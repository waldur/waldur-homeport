'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ServiceListController', ['serviceService', ServiceListController]);

  function ServiceListController(serviceService) {
    var vm = this;

    vm.list = serviceService.getServiceList();
    vm.remove = remove;

    function remove(service) {
      var index = vm.list.indexOf(service);

      service.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

})();

