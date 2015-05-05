'use strict';

(function() {
  angular.module('ncsaas')
    .controller('InitialDataController', ['usersService', '$state', InitialDataController]);

  function InitialDataController(usersService, $state) {
    var vm = this;

    vm.user = null;
    vm.errors = {};
    vm.save = save;

    usersService.getCurrentUser().then(function(response) {
      vm.user = response;
      if (response.full_name && response.email) {
        $state.go('dashboard');
      }
    });

    function save() {
      if (vm.user.full_name && vm.user.email) {
        vm.user.$update(
          function() {
            usersService.currentUser = null;
            $state.go('dashboard');
          },
          function(error) {
            vm.errors = error.data;
          }
        );
      } else {
        var errorText = 'This field is required';
        if (!vm.user.full_name) {
          vm.errors.full_name = [errorText];
        }
        if (!vm.user.email) {
          vm.errors.email = [errorText];
        }
      }
    }
  }
})();
