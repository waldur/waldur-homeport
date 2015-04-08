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


(function() {
  angular.module('ncsaas')
    .controller('UpdateProfileController', ['usersService', '$state', UpdateProfileController]);

  function UpdateProfileController(usersService, $state) {
    var vm = this;

    vm.user = {};
    vm.errors = {};
    vm.update = update;

    usersService.getCurrentUser().then(function(response) {
      vm.user = response;
    });

    function update() {
      vm.user.$update(success, error);

      function success() {
        $state.go('profile.details');
      }

      function error(response) {
        vm.errors = response.data;
      }
    }

  }

})();
