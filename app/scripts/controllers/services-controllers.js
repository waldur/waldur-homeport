'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ServiceListController', ['servicesService', ServiceListController]);

  function ServiceListController(servicesService) {
    var vm = this;

    vm.list = servicesService.getServiceList();
    vm.remove = remove;

    function remove(service) {
      var index = vm.list.indexOf(service);

      service.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

})();

