'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      '$rootScope',
      'usersService',
      UserListController
    ]);

  function UserListController($location, usersService, $rootScope) {
    var vm = this;

    vm.showgroup = false;
    vm.list = [];

    vm.search = search;
    vm.searchInput = null;

    getUsers();

    function getUsers(filter) {
      filter = filter || null;
      usersService.getList(filter).then(function(response) {
        vm.list = response;
      });
    }

    usersService.getList().then(function(response) {
      vm.list = response;
    });
    vm.remove = remove;
    vm.service = usersService;

    function remove(user) {
      var index = vm.list.indexOf(user);

      user.$delete(function() {
        vm.list.splice(index, 1);
      });
    }

    function search() {
      var filter = {full_name: vm.searchInput}
      getUsers(filter);
    }

  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      '$stateParams',
      '$rootScope',
      'usersService',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController($stateParams, $rootScope, usersService) {
    var vm = this;

    vm.activeTab = 'eventlog';
    vm.user = null;
    
    usersService.$get($stateParams.uuid).then(function(response) {
      vm.user = response;
    });
    vm.update = update;

    function update() {
      vm.user.$update();
    }

  }

})();
