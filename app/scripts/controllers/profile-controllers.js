'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProfileController',
      ['usersService', 'customersService', 'projectsService', ProfileController]);

  function ProfileController(usersService, customersService, projectsService) {
    var vm = this;
    vm.user = usersService.getCurrentUserWithKeys();
    vm.customers = customersService.getCustomersList();
    vm.projects = projectsService.getRawProjectsList();

  }

})();
