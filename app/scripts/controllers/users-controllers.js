'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      '$rootScope',
      'usersService',
      UserListController
    ]);

  function UserListController($location, usersService) {
    var vm = this;

    vm.list = usersService.getRawUserList();
    vm.remove = remove;

    function remove(user) {
      var index = vm.list.indexOf(user);

      user.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      '$routeParams',
      '$rootScope',
      'usersService',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController($routeParams, $rootScope, usersService) {
    var vm = this;

    $rootScope.bodyClass = 'obj-view';

    vm.activeTab = 'resources';
    vm.user = usersService.getUser($routeParams.uuid);
    vm.update = update;

    function update() {
      vm.user.$update();
    }

  }

})();
