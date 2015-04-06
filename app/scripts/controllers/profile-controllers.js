'use strict';

(function() {
  angular.module('ncsaas')
    .controller('ProfileController',
      ['usersService', 'customersService', 'projectsService', ProfileController]);

  function ProfileController(usersService, customersService, projectsService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.user = {};
    vm.customers = {};
    vm.projects = {};

    vm.user = usersService.getCurrentUserWithKeys();
    vm.customers = customersService.getCustomersList();
    projectsService.getList().then(function(response) {
      vm.projects = response;
    });

  }

})();
