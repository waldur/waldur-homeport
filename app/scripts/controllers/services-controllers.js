'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ServiceListController', ['servicesService', ServiceListController]);

  function ServiceListController(servicesService) {
    var vm = this;

    servicesService.getList().then(function(response){
      vm.list = response;
    });
    vm.remove = remove;

    function remove(service) {
      var index = vm.list.indexOf(service);

      service.$delete(function() {
        vm.list.splice(index, 1);
      });
    }



  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceAddController', ['servicesService', '$state', 'customersService', ServiceAddController]);

  function ServiceAddController(servicesService, $state, customersService) {
    var vm = this;
    vm.service = servicesService.$create();
    vm.save = save;
    vm.cancel = cancel;
    vm.projectList = {};
    vm.custumersList = {};

    function activate() {
      // customers
      vm.custumersList = customersService.getCustomersList();
    }

    function save() {
      vm.service.$save(success, error);

      function success(response) {
        $state.go('services.list');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

    function cancel() {
      $state.go('services.list');
    }

    activate();
  }


})();
